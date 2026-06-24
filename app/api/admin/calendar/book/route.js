import { NextResponse } from 'next/server';
import { bookAppointment } from '../../../../../lib/chatbot/scripts/calendar_helper.js';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phone, cedula, age, date, time, motive, duration } = body;

        // Validation for manual booking
        if (!name || !date || !time || !motive) {
            return NextResponse.json({ error: 'Faltan campos obligatorios: Nombre, Fecha, Hora y Motivo son requeridos.' }, { status: 400 });
        }

        // CAP MAX DURATION: Prevent endTime errors from creating 800+ min appointments
        let safeDuration = parseInt(duration) || 45;
        if (safeDuration < 10) safeDuration = 45;
        if (safeDuration > 120) safeDuration = 120;

        const result = await bookAppointment({
            name,
            phone: phone || '', // Optional
            cedula: cedula || '', // Optional
            age: age || '', // Optional
            date,
            time,
            motive,
            duration: safeDuration
        }, true); // isAdmin = true

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Admin Manual Booking POST Error:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}
