import axios from 'axios';
import fs from 'fs';
import path from 'path';

async function send() {
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        if (key && val.length > 0) acc[key.trim()] = val.join('=').trim();
        return acc;
    }, {});

    const EVOLUTION_API_URL = env.EVOLUTION_API_URL;
    const EVOLUTION_API_KEY = env.EVOLUTION_API_KEY;
    const EVOLUTION_INSTANCE = env.EVOLUTION_INSTANCE;

    const phoneNumber = "0967491847";
    const patientName = "CR (Prueba)";
    const todayStr = new Date().toISOString().split('T')[0];
    const timeFormatted = "15:00"; // Dummy time for test

    const message = `¡Hola ${patientName}! 👋 Te recordamos tu cita en *Hexadent* para hoy ${todayStr} a las *${timeFormatted}*. \n\n¿Confirmas tu asistencia? (Responde SÍ o NO). *Si respondes NO, tu cita se cancelará automáticamente para liberar el espacio.*`;

    // Clean number
    let cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
        cleanNumber = '593' + cleanNumber.substring(1);
    }

    const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

    console.log(`[Manual Reminder] Sending to ${cleanNumber} via instance ${EVOLUTION_INSTANCE}`);

    const body = {
        number: cleanNumber,
        text: String(message),
        linkPreview: false
    };

    try {
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            }
        });
        console.log("[Manual Reminder] SUCCESS:", response.data?.key?.id || "Message Sent");
    } catch (error) {
        console.error("[Manual Reminder] FAILURE:", error.response?.data || error.message);
    }
}

send();
