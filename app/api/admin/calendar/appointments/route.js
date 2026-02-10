import { NextResponse } from 'next/server';
import db from '../../../../../lib/db.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        let query = 'SELECT * FROM appointments';
        let params = [];

        if (date) {
            query += ' WHERE appointment_date = ?';
            params.push(date);
        }

        query += ' ORDER BY appointment_date DESC, appointment_time ASC';

        const [rows] = await db.execute(query, params);
        return NextResponse.json(rows, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Appointments GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        await db.execute(
            'UPDATE appointments SET status = ? WHERE id = ?',
            [status, id]
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Appointments PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        await db.execute('DELETE FROM appointments WHERE id = ?', [id]);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Appointments DELETE Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
