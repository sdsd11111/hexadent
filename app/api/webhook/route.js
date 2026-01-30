import { NextResponse } from 'next/server';
import { processChatbotMessage } from '../../../lib/chatbot/logic';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const payload = await request.json();
        console.log('Webhook Payload Received:', JSON.stringify(payload, null, 2));

        let messages = [];

        // 1. Handle YCloud Format (whatsappInboundMessage key)
        if (payload.whatsappInboundMessage) {
            const msg = payload.whatsappInboundMessage;
            messages.push({
                from: msg.from,
                to: msg.to, // Clinic number
                text: msg.text?.body || msg.body || msg.text
            });
        }
        // 2. Handle older YCloud or other variations
        else if (payload.event?.startsWith('whatsapp.inbound_message') || payload.whatsapp?.message) {
            const msg = payload.whatsapp?.message || payload.message;
            if (msg) {
                messages.push({
                    from: msg.from,
                    text: msg.text?.body || msg.body || msg.text
                });
            }
        }
        // 3. Handle Meta/WhatsApp Cloud API Format
        else {
            const entry = payload.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            const metaMessages = value?.messages || payload.messages || [];

            for (const m of metaMessages) {
                messages.push({
                    from: m.from,
                    text: m.text?.body || m.body || m.text
                });
            }
        }

        if (!messages || messages.length === 0) {
            console.log("No messages found in payload structure. Keys:", Object.keys(payload));
            return NextResponse.json({ status: 'no_messages', receivedKeys: Object.keys(payload) }, { status: 200 });
        }

        for (const msg of messages) {
            const from = msg.from;
            const text = msg.text?.body || msg.body || msg.text;
            const to = msg.to; // Clinic number from YCloud v2

            if (from && text) {
                console.log(`Processing message from ${from} to ${to}: ${text}`);
                await processChatbotMessage(from, text, to);
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Webhook Error Trace:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Webhook is active' });
}
