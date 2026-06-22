// Send reminder NOW to test number - LOAD ENV FIRST
import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { sendWhatsAppMessage } = await import('./lib/whatsapp/evolution.js');

async function sendReminderNow() {
    const phone = '593967491847';
    const message = `¡Hola! 👋 Te recordamos tu cita en Hexadent para hoy 2026-06-22 a las 19:30. ¿Confirmas tu asistencia? (Responde SÍ o NO). Si respondes NO, tu cita se cancelará automáticamente para liberar el espacio.`;
    
    console.log(`[SENDING REMINDER] To: ${phone}`);
    console.log(`Message: ${message}`);
    
    try {
        const result = await sendWhatsAppMessage(phone, message);
        console.log('✅ SENT! Result:', result);
    } catch (e) {
        console.error('❌ ERROR:', e.message);
    }
    
    process.exit(0);
}

sendReminderNow();