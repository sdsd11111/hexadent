const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const { checkAvailability, bookAppointment } = require('./scripts/calendar_helper');
const { sendWhatsAppMessage } = require('./scripts/whatsapp_template');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Paths to Skill documentation
const KNOWLEDGE_BASE_PATH = path.join(__dirname, 'resources', 'knowledge_base.md');
const SKILL_INSTRUCTIONS_PATH = path.join(process.cwd(), 'Skills', 'DentalChatbot', 'SKILL.md');

/**
 * Main AI logic for the Dental Chatbot.
 */
async function processChatbotMessage(phoneNumber, messageText) {
    try {
        const knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
        const skillInstructions = fs.readFileSync(SKILL_INSTRUCTIONS_PATH, 'utf8');

        // SYSTEM PROMPT
        const systemPrompt = `
        ${skillInstructions}
        
        CONTEXTO DE LA CLÍNICA (CONOCIMIENTOS):
        ${knowledgeBase}
        
        REGLAS ADICIONALES:
        - Si el usuario pregunta por brackets, recalca que la Valoración Clínica ($15) es OBLIGATORIA.
        - Sé empático y profesional. Usa "estimada/o", "con mucho gusto" y "turnito".
        - ID de Calendario: ${process.env.GOOGLE_CALENDAR_ID}
        
        FLUJO DE AGENDAMIENTO:
        1. Saludo.
        2. Si pide cita, solicita Nombre Completo.
        3. Solicita Cédula o Edad.
        4. Solicita fecha y hora preferida.
        5. Confirma el "turnito".
        
        IMPORTANTE: Si el usuario proporciona una fecha y hora, responde con un formato especial al final de tu mensaje si crees que es una solicitud de cita: [DATE: YYYY-MM-DD] [TIME: HH:MM].
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Usuario (${phoneNumber}): ${messageText}` }
        ]);

        const response = result.response.text();

        // Log activity (optional, could write to a JSON file for the Admin page)
        logActivity(phoneNumber, messageText, response);

        // Send back via WhatsApp
        await sendWhatsAppMessage(phoneNumber, response);

        return { success: true };
    } catch (error) {
        console.error("Chatbot Logic Error:", error);
        throw error;
    }
}

/**
 * Simple file-based activity log for the Admin dashboard
 */
function logActivity(phone, userMsg, botResp) {
    const logPath = path.join(process.cwd(), 'chatbot_logs.json');
    let logs = [];
    try {
        if (fs.existsSync(logPath)) {
            logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        }
    } catch (e) { }

    logs.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        phone,
        userMsg,
        botResp: botResp.substring(0, 100) + (botResp.length > 100 ? '...' : '')
    });

    // Keep last 50 logs
    fs.writeFileSync(logPath, JSON.stringify(logs.slice(0, 50), null, 2));
}

module.exports = { processChatbotMessage };
