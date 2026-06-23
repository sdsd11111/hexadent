// Send reminder NOW using axios directly
import axios from 'axios';

const EVOLUTION_API_URL = 'http://178.238.238.158:8080';
const EVOLUTION_API_KEY = '42a447c1-3d74-4b52-9571-042c174f7621';
const EVOLUTION_INSTANCE = 'Odontologa';

async function sendReminderNow() {
    const phone = '593967491847';
    const message = `¡Hola! 👋 Te recordamos tu cita en Hexadent para hoy 2026-06-22 a las 22:00. ¿Confirmas tu asistencia? (Responde SÍ o NO). Si respondes NO, tu cita se cancelará automáticamente para liberar el espacio.`;
    
    console.log(`[SENDING] To: ${phone}`);
    
    try {
        const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;
        const body = {
            number: phone,
            text: message
        };
        const headers = {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
        };
        
        const result = await axios.post(url, body, { headers });
        console.log('✅ SENT!', result.data);
    } catch (e) {
        console.error('❌ ERROR:', e.response?.data || e.message);
    }
    
    process.exit(0);
}

sendReminderNow();