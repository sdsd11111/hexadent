/**
 * Next.js Route Handler for YCloud WhatsApp Webhook
 * Path: app/api/webhook/route.js
 */

import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/chatbot/whatsapp_template'; // Adjust path accordingly
// import { checkAvailability } from '@/lib/chatbot/calendar_helper'; 

export async function POST(req) {
    try {
        const data = await req.json();

        // Check if it's an inbound message from YCloud
        if (data.event === 'whatsapp.inbound_message.received') {
            const message = data.whatsappInboundMessage;
            const from = message.from; // Patient's number
            const text = message.text ? message.text.body : '';

            console.log(`Received message from ${from}: ${text}`);

            // BOT LOGIC (Can be expanded)
            if (text.toLowerCase().includes('hola') || text.toLowerCase().includes('cita')) {
                await sendWhatsAppMessage(from, "¡Hola! Gracias por comunicarte con Hexadent. ¿En qué podemos ayudarte hoy? (Información de brackets, limpieza o agendar una cita)");
            } else if (text.toLowerCase().includes('precio') || text.toLowerCase().includes('costo')) {
                await sendWhatsAppMessage(from, "Nuestras valoraciones clínicas tienen un costo de $15. Otros servicios como Ortodoncia varían entre $800 y $1500. ¿Deseas agendar una cita para valoración?");
            } else {
                await sendWhatsAppMessage(from, "Con mucho gusto te ayudaremos. Por favor indícanos tu nombre completo y en qué horario te gustaría ser atendido.");
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
