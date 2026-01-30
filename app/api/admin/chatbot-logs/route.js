import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Ensure table exists first
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                phone VARCHAR(50),
                user_msg TEXT,
                bot_resp TEXT
            )
        `).catch(() => { });

        const [rows] = await db.execute('SELECT id, timestamp, phone, user_msg as userMsg, bot_resp as botResp FROM chatbot_logs ORDER BY timestamp DESC LIMIT 50');
        return NextResponse.json(rows || []);
    } catch (error) {
        console.error("Admin Log Fetch Error:", error);
        return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
    }
}
