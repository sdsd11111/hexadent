/**
 * Webhook Server for Hexadent Dental Chatbot
 * This server receives messages from YCloud and triggers the bot logic.
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { sendWhatsAppMessage } = require('./scripts/whatsapp_template');
const { checkAvailability } = require('./scripts/calendar_helper');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Webhook endpoint to receive messages from YCloud
app.post('/webhook', async (req, res) => {
    const data = req.body;

    // Check if it's an inbound message
    if (data.event === 'whatsapp.inbound_message.received') {
        const message = data.whatsappInboundMessage;
        const from = message.from; // Patient's number
        const text = message.text ? message.text.body : '';

        console.log(`Received message from ${from}: ${text}`);

        // SIMPLE BOT LOGIC (This should eventually be handled by the Antigravity Agent using the skill)
        if (text.toLowerCase().includes('hola') || text.toLowerCase().includes('cita')) {
            await sendWhatsAppMessage(from, "¡Hola! Gracias por comunicarte con Hexadent. ¿En qué podemos ayudarte hoy? (Información de brackets, limpieza o agendar una cita)");
        } else if (text.toLowerCase().includes('precio') || text.toLowerCase().includes('costo')) {
            await sendWhatsAppMessage(from, "Nuestras valoraciones clínicas tienen un costo de $15. Otros servicios como Ortodoncia varían entre $800 y $1500. ¿Deseas agendar una cita para valoración?");
        } else {
            await sendWhatsAppMessage(from, "Con mucho gusto te ayudaremos. Por favor indícanos tu nombre completo y en qué horario te gustaría ser atendido.");
        }
    }

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}/webhook`);
});
