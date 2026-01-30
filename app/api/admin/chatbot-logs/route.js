import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await db.execute('SELECT id, timestamp, phone, user_msg as userMsg, bot_resp as botResp FROM chatbot_logs ORDER BY timestamp DESC LIMIT 50');
        return NextResponse.json(rows || []);
    } catch (error) {
        console.error("Admin Log Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
    }
}
