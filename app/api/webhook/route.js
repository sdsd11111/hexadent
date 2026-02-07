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
            const from = data?.key?.remoteJid?.split('@')[0];
            const text = msg?.conversation || msg?.extendedTextMessage?.text;

            if (from && text && !data?.key?.fromMe) {
                messages.push({
                    from: from,
                    to: 'evolution_instance',
                    text: text
                });
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
