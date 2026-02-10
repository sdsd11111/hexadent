import { NextResponse } from 'next/server';
import db from '../../../../../lib/db.js';

export async function GET() {
    try {
        const [rows] = await db.execute('SELECT * FROM blocked_dates ORDER BY blocked_date ASC');
        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Blocked Dates GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
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
