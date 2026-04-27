

// require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');

const ENV = {
    MYSQL_HOST: 'mysql.us.stackcp.com',
    MYSQL_PORT: 39908,
    MYSQL_USER: 'odontologa-35303936dec6',
    MYSQL_PASSWORD: 'dhoy9qbzlu',
    MYSQL_DATABASE: 'odontologa-35303936dec6',
    EVOLUTION_API_URL: 'http://129.153.116.213:8080',
    EVOLUTION_API_KEY: '42a447c1-3d74-4b52-9571-042c174f7621',
    EVOLUTION_INSTANCE: 'odontologa'
};

async function sendWhatsAppMessage(phoneNumber, message) {
    const url = `${ENV.EVOLUTION_API_URL}/message/sendText/${ENV.EVOLUTION_INSTANCE}`;

    // Clean number: remove +, spaces, etc.
    let cleanNumber = phoneNumber.replace(/\D/g, '');

    // Normalize Ecuador numbers
    if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
        cleanNumber = '593' + cleanNumber.substring(1);
    } else if (cleanNumber.length === 9 && cleanNumber.startsWith('9')) {
        cleanNumber = '593' + cleanNumber;
    }

    const data = {
        number: cleanNumber,
        text: message,
        linkPreview: false
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': ENV.EVOLUTION_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
        return null;
    }
}

async function runCron() {
    const db = await mysql.createConnection({
        host: ENV.MYSQL_HOST,
        port: ENV.MYSQL_PORT,
        user: ENV.MYSQL_USER,
        password: ENV.MYSQL_PASSWORD,
        database: ENV.MYSQL_DATABASE
    });

    try {
        const now = new Date();
        const ecuadorToday = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        const todayStr = ecuadorToday.toISOString().split('T')[0];

        console.log(`[Manual Cron] Checking appointments for TODAY (${todayStr})...`);

        const [appointments] = await db.execute(
            `SELECT id, patient_name, patient_phone, appointment_time 
             FROM appointments 
             WHERE appointment_date = ? AND status = 'scheduled' AND reminder_sent = 0`,
            [todayStr]
        );

        console.log(`[Manual Cron] Found ${appointments.length} appointments to remind.`);

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        let sentCount = 0;

        for (let i = 0; i < appointments.length; i++) {
            const app = appointments[i];

            if (i > 0) {
                console.log(`[Manual Cron] Throttling... waiting 30 seconds before next message to ${app.patient_phone}`);
                await sleep(30000);
            }

            const timeFormatted = app.appointment_time.substring(0, 5);
            const message = `¡Hola ${app.patient_name}! 👋 Te recordamos tu cita en *Hexadent* para hoy ${todayStr} a las *${timeFormatted}*. \n\n¿Confirmas tu asistencia? (Responde SÍ o NO). *Si respondes NO, tu cita se cancelará automáticamente para liberar el espacio.*`;

            try {
                const result = await sendWhatsAppMessage(app.patient_phone, message);
                if (result) {
                    await db.execute('UPDATE appointments SET reminder_sent = 1 WHERE id = ?', [app.id]);
                    sentCount++;
                    console.log(`[Manual Cron] Success: Reminder sent to ${app.patient_name} (${app.patient_phone})`);
                }
            } catch (err) {
                console.error(`[Manual Cron] Error sending to ${app.patient_phone}:`, err.message);
            }
        }

        console.log(`[Manual Cron] Finished. Sent ${sentCount} reminders.`);

    } catch (error) {
        console.error('[Manual Cron] Error:', error.message);
    } finally {
        await db.end();
    }
}

runCron();
