import { NextResponse } from 'next/server';
import db from '@/lib/db';

async function ensureTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS ignored_numbers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ensure 'name' column exists if table was created previously without it
    try {
        const [cols] = await db.execute("SHOW COLUMNS FROM ignored_numbers LIKE 'name'");
        if (cols.length === 0) {
            await db.execute("ALTER TABLE ignored_numbers ADD COLUMN name VARCHAR(100) AFTER phone");
        }
    } catch (e) { console.error("Error adding name column:", e); }
}

export async function GET() {
    try {
        await ensureTable();
        const [rows] = await db.execute('SELECT phone, name FROM ignored_numbers ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { phone, name, action } = await request.json();
        await ensureTable();

        if (action === 'add') {
            const cleanPhone = phone.replace(/\D/g, '');
            await db.execute('INSERT INTO ignored_numbers (phone, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?', [cleanPhone, name, name]);
        } else if (action === 'remove') {
            const cleanPhone = phone.replace(/\D/g, '');
            await db.execute('DELETE FROM ignored_numbers WHERE phone = ?', [cleanPhone]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
