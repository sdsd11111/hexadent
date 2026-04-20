import { NextResponse } from 'next/server';
import { ensureTables } from '../../../lib/chatbot/logic.js';
import { inngest } from '../../../lib/inngest/client.js';
import db from '../../../lib/db.js';

export const dynamic = 'force-dynamic';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

/**
 * Handle Meta Webhook Verification (GET)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Meta Webhook] Verification SUCCESS');
        return new Response(challenge, { status: 200 });
    } else {
        console.error('[Meta Webhook] Verification FAILED');
        return new Response('Forbidden', { status: 403 });
    }
}

/**
 * Handle Incoming Messages (POST)
 */
export async function POST(request) {
    try {
        const payload = await request.json();
        console.log('Webhook Payload Received:', JSON.stringify(payload, null, 2));

        let messages = [];

        // 1. Evolution API Format (messages.upsert) - PRIMARY
        if (payload.event === 'messages.upsert') {
            const data = payload.data;
            const msg = data?.message;
            const remoteJid = data?.key?.remoteJid || '';
            const isGroup = remoteJid.includes('@g.us');
            const from = remoteJid.split('@')[0].split(':')[0];

            // Detect text in various spots
            let text = msg?.conversation || msg?.extendedTextMessage?.text;

            // DETECT AUDIO
            if (!text && (msg?.audioMessage || data?.messageType === 'audio')) {
                console.log(`[Webhook] Audio detected from ${from}. Attempting transcription...`);
                try {
                    // Import dynamically to avoid overhead on text-only messages
                    const { transcribeAudio } = await import('../../../lib/chatbot/transcription');

                    // Evolution API usually sends base64 in data.base64 or we might need to fetch it
                    // Check multiple paths where Evolution API variants might inject the base64 string
                    const base64 = data?.base64 || msg?.base64 || payload?.base64 || msg?.audioMessage?.base64 || undefined;

                    if (base64) {
                        text = await transcribeAudio(base64);
                        console.log(`[Webhook] Audio transcribed for ${from}: "${text}"`);
                    } else {
                        console.warn(`[Webhook] Audio message received but no base64 found. Ensure Evolution API has media base64 enabled.`);
                        // STILL send a message to the bot so it can respond to the user
                        text = "El usuario envió un mensaje de voz que no pudo ser transcrito. Pídele amablemente que lo escriba en texto.";
                    }
                } catch (e) {
                    console.error(`[Webhook] Transcription FAILED:`, e.message);
                    text = "El usuario envió un mensaje de voz pero hubo un error al procesarlo. Pídele amablemente que lo escriba en texto.";
                }
            }

            // DETECT OTHER MEDIA (IMAGE, VIDEO, STICKER) - IGNORE COMPLETELY
            if (!text && (msg?.imageMessage || msg?.videoMessage || msg?.stickerMessage || msg?.documentMessage)) {
                console.log(`[Webhook] Non-audio media from ${from}. IGNORING - no bot processing.`);
                // Return early - do not send to bot
                return NextResponse.json({ status: 'media_ignored' }, { status: 200 });
            }

            // PRODUCTION MODE: Respond to ALL numbers
            if (from && text && !data?.key?.fromMe && !isGroup) {
                // Ignore empty status updates or empty text
                if (text && text.trim().length > 0) {
                    messages.push({
                        from: from,
                        to: 'evolution_instance',
                        text: text.trim()
                    });
                }
            } else if (from && data?.key?.fromMe && !isGroup) {
                // AUTO-RELIEVE: If doctor sends a message, put bot to sleep for 12h
                console.log(`[Webhook] Outgoing message detected to ${from}. Activation SLEEP mode for bot.`);
                try {
                    const db = (await import('../../../lib/db.js')).default;
                    await db.execute('INSERT INTO handoff_sessions (phone, expires_at) VALUES (?, NOW() + INTERVAL 12 HOUR) ON DUPLICATE KEY UPDATE expires_at = NOW() + INTERVAL 12 HOUR', [from]);
                } catch (e) {
                    console.error("[Webhook] Failed to set auto-handoff:", e.message);
                }
            }
        }
        // 2. Meta/WhatsApp Cloud API Format (Legacy Fallback)
        else if (payload.object === 'whatsapp_business_account') {
            const entry = payload.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            const metaMessages = value?.messages || [];

            // PRODUCTION MODE: Accept all Meta messages
            for (const m of metaMessages) {
                if (m.type === 'text') {
                    messages.push({
                        from: m.from,
                        to: value.metadata?.display_phone_number,
                        text: m.text?.body
                    });
                }
            }
        }

        if (messages.length === 0) {
            console.log("No messages found in payload structure.");
            return NextResponse.json({ status: 'no_messages' }, { status: 200 });
        }

        for (const msg of messages) {
            if (msg.from && msg.text) {
                console.log(`[Webhook] Dispatching to Inngest for ${msg.from}`);
                await ensureTables();
                // We still buffer to handle rapid-fire grouping in Inngest
                await db.execute('INSERT INTO chatbot_buffer (phone, message) VALUES (?, ?)', [msg.from, msg.text]);
                
                await inngest.send({
                    name: "chatbot/message.received",
                    data: {
                        phoneNumber: msg.from,
                        text: msg.text,
                        clinicNumber: msg.to
                    }
                });
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Webhook Error Trace:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
