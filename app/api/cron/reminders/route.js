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
        // 1. Get appointments for TODAY that haven't received a reminder
        // Using Ecuador time (-5)
        const now = new Date();
        const ecuadorToday = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        const todayStr = ecuadorToday.toISOString().split('T')[0];

        // Optional: filter by specific phone number (for testing)
        const { searchParams } = new URL(req.url);
        const filterPhone = searchParams.get('phone');
        
        console.log(`[Cron Reminders] Checking appointments for TODAY (${todayStr})...${filterPhone ? ` [filter: ${filterPhone}]` : ''}`);

        let query = `SELECT id, patient_name, patient_phone, appointment_time 
             FROM appointments 
             WHERE appointment_date = ? AND status = 'scheduled' AND reminder_sent = 0`;
        let params = [todayStr];
        
        if (filterPhone) {
            query += ` AND patient_phone LIKE ?`;
            params.push(`%${filterPhone.replace(/\D/g, '')}%`);
        }
        
        const [appointments] = await db.execute(query, params);

        console.log(`[Cron Reminders] Found ${appointments.length} appointments to remind.`);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let sentCount = 0;

        for (let i = 0; i < appointments.length; i++) {
            const app = appointments[i];

            // Apply 30s delay between messages (skip delay for the first one)
            if (i > 0) {
                console.log(`[Cron Reminders] Throttling... waiting 30 seconds before next message to ${app.patient_phone}`);
                await sleep(30000);
            }

            const timeFormatted = app.appointment_time.substring(0, 5);
            const message = `¡Hola ${app.patient_name}! 👋 Te recordamos tu cita en *Hexadent* para hoy ${todayStr} a las *${timeFormatted}*. \n\n¿Confirmas tu asistencia? (Responde SÍ o NO). *Si respondes NO, tu cita se cancelará automáticamente para liberar el espacio.*`;

            try {
                const result = await sendWhatsAppMessage(app.patient_phone, message);
                if (result) {
                    await db.execute('UPDATE appointments SET reminder_sent = 1 WHERE id = ?', [app.id]);
                    
                    // Guardar contexto de confirmación en sesión
                    const cleanPhone = app.patient_phone.replace(/\D/g, '');
                    const sessionData = {
                        current_flow: 'awaiting_confirmation',
                        metadata: {
                            awaiting_confirmation: {
                                appointmentId: app.id,
                                date: todayStr,
                                time: app.appointment_time,
                                patientName: app.patient_name
                            }
                        }
                    };
                    
                    await db.execute(`
                        INSERT INTO chatbot_sessions (phone, current_flow, metadata) 
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                            current_flow = VALUES(current_flow),
                            metadata = VALUES(metadata)
                    `, [cleanPhone, sessionData.current_flow, JSON.stringify(sessionData.metadata)]);
                    
                    console.log(`[Cron Reminders] Saved confirmation context for ${cleanPhone}`);
                    
                    sentCount++;
                }
            } catch (err) {
                console.error(`[Cron Reminders] Error sending to ${app.patient_phone}:`, err.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sent ${sentCount} reminders for ${todayStr}.`
        });

    } catch (error) {
        console.error('[Cron Reminders] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
