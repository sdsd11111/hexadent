import { NextResponse } from 'next/server';
import db from '@/lib/db';

async function ensureTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS ignored_numbers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone VARCHAR(50) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function GET() {
    try {
        await ensureTable();
        const [rows] = await db.execute('SELECT phone FROM ignored_numbers ORDER BY created_at DESC');
        return NextResponse.json(rows.map(r => r.phone));
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { phone, action } = await request.json();
        await ensureTable();

        if (action === 'add') {
            const cleanPhone = phone.replace(/\D/g, '');
            await db.execute('INSERT IGNORE INTO ignored_numbers (phone) VALUES (?)', [cleanPhone]);
        } else if (action === 'remove') {
            await db.execute('DELETE FROM ignored_numbers WHERE phone = ?', [phone]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
