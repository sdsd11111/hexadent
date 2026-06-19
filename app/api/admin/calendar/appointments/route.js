import { NextResponse } from 'next/server';
import db from '../../../../../lib/db.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');

        let rows;

        if (date) {
            [rows] = await db.execute(
                'SELECT id, patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive FROM appointments WHERE appointment_date = ? ORDER BY appointment_time ASC',
                [date]
            );
        } else {
            [rows] = await db.execute(
                'SELECT id, patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive FROM appointments ORDER BY appointment_date DESC, appointment_time ASC LIMIT 100'
            );
        }
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

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, motive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (patient_name !== undefined) { updates.push('patient_name = ?'); values.push(patient_name); }
        if (patient_phone !== undefined) { updates.push('patient_phone = ?'); values.push(patient_phone); }
        if (patient_cedula !== undefined) { updates.push('patient_cedula = ?'); values.push(patient_cedula); }
        if (patient_age !== undefined) { updates.push('patient_age = ?'); values.push(patient_age); }
        if (appointment_date !== undefined) { updates.push('appointment_date = ?'); values.push(appointment_date); }
        if (appointment_time !== undefined) { updates.push('appointment_time = ?'); values.push(appointment_time); }
        if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); values.push(duration_minutes); }
        if (motive !== undefined) { updates.push('motive = ?'); values.push(motive); }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(id);
        
        await db.execute(
            `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Admin Calendar Appointments PUT Error:', error);
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
