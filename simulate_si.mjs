// Simulate receiving "Si" message via webhook
import axios from 'axios';

async function simulateMessage() {
    const phone = '593967491847';
    const message = 'Si';
    
    console.log(`[SIMULATING] Message from ${phone}: "${message}"`);
    
    try {
        // Call the local webhook
        const payload = {
            event: 'messages.upsert',
            key: {
                remoteJid: `${phone}@s.whatsapp.net`,
                fromMe: false
            },
            message: {
                conversation: message
            },
            messageType: 'conversation'
        };
        
        const result = await axios.post('http://localhost:3000/api/webhook', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Processed!', result.data);
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
    
    process.exit(0);
}

simulateMessage();