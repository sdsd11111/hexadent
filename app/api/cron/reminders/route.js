import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp/evolution';

export async function GET(req) {
    // Basic security: Check for an API key in headers to prevent unauthorized triggers
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Get appointments for tomorrow that haven't received a reminder
        // Using Ecuador time (-5)
        const now = new Date();
        const tomorrow = new Date(now.getTime() - (5 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000));
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        console.log(`[Cron Reminders] Checking appointments for ${tomorrowStr}...`);

        const [appointments] = await db.execute(
            `SELECT id, patient_name, patient_phone, appointment_time 
             FROM appointments 
             WHERE appointment_date = ? AND status = 'scheduled' AND reminder_sent = 0`,
            [tomorrowStr]
        );

        console.log(`[Cron Reminders] Found ${appointments.length} appointments to remind.`);

        let sentCount = 0;
        for (const app of appointments) {
            const timeFormatted = app.appointment_time.substring(0, 5);
            const message = `¡Hola ${app.patient_name}! 👋 Te recordamos tu cita en *Hexadent* para mañana el ${tomorrowStr} a las *${timeFormatted}*. \n\n¿Confirmas tu asistencia? (Responde SÍ o NO)`;

            try {
                const result = await sendWhatsAppMessage(app.patient_phone, message);
                if (result) {
                    await db.execute('UPDATE appointments SET reminder_sent = 1 WHERE id = ?', [app.id]);
                    sentCount++;
                }
            } catch (err) {
                console.error(`[Cron Reminders] Error sending to ${app.patient_phone}:`, err.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${sentCount} reminders for ${tomorrowStr}.`
        });

    } catch (error) {
        console.error('[Cron Reminders] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
