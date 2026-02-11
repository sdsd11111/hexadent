import { NextResponse } from 'next/server';
import { processChatbotMessage } from '../../../lib/chatbot/logic';
import { debounceMessage } from '../../../lib/chatbot/debouncer';

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
            const from = remoteJid.split('@')[0];

            // Detect text in various spots
            let text = msg?.conversation || msg?.extendedTextMessage?.text;

            // DETECT AUDIO
            if (!text && (msg?.audioMessage || data?.messageType === 'audio')) {
                console.log(`[Webhook] Audio detected from ${from}. Attempting transcription...`);
                try {
                    // Import dynamically to avoid overhead on text-only messages
                    const { transcribeAudio } = await import('../../../lib/chatbot/transcription');

                    // Evolution API usually sends base64 in data.base64 or we might need to fetch it
                    // If instances are configured with base64: true, it comes in payload.data.base64
                    const base64 = data?.base64;

                    if (base64) {
                        const buffer = Buffer.from(base64, 'base64');
                        text = await transcribeAudio(buffer);
                        console.log(`[Webhook] Audio transcribed for ${from}: "${text}"`);
                    } else {
                        console.warn(`[Webhook] Audio message received but no base64 found. Ensure Evolution API has media base64 enabled.`);
                        text = "(Mensaje de voz no procesado: faltan datos de audio)";
                    }
                } catch (e) {
                    console.error(`[Webhook] Transcription FAILED:`, e.message);
                    text = "(Error al procesar mensaje de voz)";
                }
            }

            if (from && text && !data?.key?.fromMe && !isGroup) {
                // Ignore empty status updates or empty text
                if (text && text.trim().length > 0) {
                    messages.push({
                        from: from,
                        to: 'evolution_instance',
                        text: text.trim()
                    });
                }
            }
        }
        // 2. Meta/WhatsApp Cloud API Format (Legacy Fallback)
        else if (payload.object === 'whatsapp_business_account') {
            const entry = payload.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            const metaMessages = value?.messages || [];

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
                console.log(`[Webhook] Queuing message (3s debounce) from ${msg.from}: ${msg.text}`);
                await debounceMessage(msg.from, msg.text, msg.to);
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
