import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logPath = path.join(process.cwd(), 'chatbot_logs.json');
        if (fs.existsSync(logPath)) {
            const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            return NextResponse.json(logs);
        }
        return NextResponse.json([]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 });
    }
}
