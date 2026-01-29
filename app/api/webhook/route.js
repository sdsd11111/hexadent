import { NextResponse } from 'next/server';
const { processChatbotMessage } = require('@/lib/chatbot/logic');

export async function POST(request) {
    try {
        const payload = await request.json();

        // YCloud WhatsApp payload structure (simplified)
        // Adjust this based on actual YCloud/Meta webhook format
        const messages = payload.value?.messages || payload.messages || [];

        for (const msg of messages) {
            const from = msg.from;
            const text = msg.text?.body || msg.body;

            if (from && text) {
                console.log(`Received message from ${from}: ${text}`);
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
