import { NextResponse } from 'next/server';
import db from '../../../../../lib/db.js';

async function ensureBlockedTimeSlotsTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS blocked_time_slots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            blocked_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            reason VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_blocked_date (blocked_date)
        )
    `);
}

export async function GET(request) {
    try {
        await ensureBlockedTimeSlotsTable();
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        let rows;
        if (date) {
            [rows] = await db.execute(
                'SELECT id, blocked_date, start_time, end_time, reason FROM blocked_time_slots WHERE blocked_date = ? ORDER BY start_time ASC',
                [date]
            );
        } else {
            [rows] = await db.execute(
                'SELECT id, blocked_date, start_time, end_time, reason FROM blocked_time_slots ORDER BY blocked_date ASC, start_time ASC'
            );
        }

        // Normalize time fields
        const formatted = rows.map(r => ({
            ...r,
            blocked_date: r.blocked_date instanceof Date ? r.blocked_date.toISOString().split('T')[0] : r.blocked_date,
            start_time: r.start_time ? r.start_time.toString().substring(0, 5) : '',
            end_time: r.end_time ? r.end_time.toString().substring(0, 5) : ''
        }));

        return NextResponse.json(formatted, { status: 200 });
    } catch (error) {
        console.error('Blocked Time Slots GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await ensureBlockedTimeSlotsTable();
        const body = await request.json();
        const { date, start_time, end_time, reason } = body;

        if (!date) {
            return NextResponse.json({ error: 'Missing date' }, { status: 400 });
        }
        if (!start_time || !end_time) {
            return NextResponse.json({ error: 'Missing start_time or end_time' }, { status: 400 });
        }

        const [result] = await db.execute(
            'INSERT INTO blocked_time_slots (blocked_date, start_time, end_time, reason) VALUES (?, ?, ?, ?)',
            [date, start_time, end_time, reason || '']
        );

        return NextResponse.json({ success: true, id: result.insertId }, { status: 201 });
    } catch (error) {
        console.error('Blocked Time Slots POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const date = searchParams.get('date');

        if (id) {
            await db.execute('DELETE FROM blocked_time_slots WHERE id = ?', [id]);
        } else if (date) {
            // Delete all time blocks for a specific date
            await db.execute('DELETE FROM blocked_time_slots WHERE blocked_date = ?', [date]);
        } else {
            return NextResponse.json({ error: 'Missing id or date parameter' }, { status: 400 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Blocked Time Slots DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
