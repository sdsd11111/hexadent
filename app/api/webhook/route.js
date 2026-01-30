import { NextResponse } from 'next/server';
import { processChatbotMessage } from '@/lib/chatbot/logic';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const payload = await request.json();
        console.log('Webhook Payload Received:', JSON.stringify(payload, null, 2));

        let messages = [];

        // 1. Handle YCloud Format (whatsapp.inbound_message_received)
        if (payload.event === 'whatsapp.inbound_message_received' && payload.whatsapp?.message) {
            messages.push({
                from: payload.whatsapp.message.from,
                text: payload.whatsapp.message.text?.body || payload.whatsapp.message.body
            });
        }
        // 2. Handle Meta/WhatsApp Cloud API Format
        else {
            const entry = payload.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            messages = value?.messages || payload.messages || [];
        }

        if (!messages || messages.length === 0) {
            console.log("No messages found in payload.");
            return NextResponse.json({ status: 'no_messages' });
        }

        for (const msg of messages) {
            const from = msg.from;
            const text = msg.text?.body || msg.body || msg.text;

            if (from && text) {
                console.log(`Processing message from ${from}: ${text}`);
                await processChatbotMessage(from, text);
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Webhook is active' });
}
