import { NextResponse } from 'next/server';
import db from '../../../../../lib/db.js';

async function ensureBlockedDatesTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS blocked_dates (
            blocked_date DATE PRIMARY KEY,
            reason VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function GET() {
    try {
        await ensureBlockedDatesTable();
        const [rows] = await db.execute('SELECT * FROM blocked_dates ORDER BY blocked_date ASC');
        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Blocked Dates GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await ensureBlockedDatesTable();
        const body = await request.json();
        const { date, reason } = body;

        if (!date) {
            return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
        }

        await db.execute(
            'INSERT INTO blocked_dates (blocked_date, reason) VALUES (?, ?)',
            [date, reason || '']
        );

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Date already blocked' }, { status: 409 });
        }
        console.error('Admin Calendar Blocked Dates POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
        }

        await db.execute('DELETE FROM blocked_dates WHERE blocked_date = ?', [date]);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Blocked Dates DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
