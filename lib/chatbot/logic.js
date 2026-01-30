import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import db from '@/lib/db'; // Using centralized pool
import { checkAvailability, bookAppointment } from './scripts/calendar_helper';
import { sendWhatsAppMessage } from './scripts/whatsapp_template';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Paths to Skill documentation - Using absolute paths from process.cwd() for Vercel
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'knowledge_base.md');
const SKILL_INSTRUCTIONS_PATH = path.join(process.cwd(), 'Skills', 'DentalChatbot', 'SKILL.md');

async function ensureLogTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                phone VARCHAR(50),
                user_msg TEXT,
                bot_resp TEXT
            )
        `);
    } catch (err) {
        // Silently handle "table already exists" or other DB errors
        if (!err.message.includes('already exists')) {
            console.error("Error ensuring log table:", err.message);
        }
    }
}

/**
 * Main AI logic for the Dental Chatbot.
 */
export async function processChatbotMessage(phoneNumber, messageText) {
    console.log(`[Chatbot] Processing message from ${phoneNumber}: ${messageText}`);

    try {
        let knowledgeBase = "No information available.";
        let skillInstructions = "Be a helpful dental assistant.";

        try {
            if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
                knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
            } else {
                console.warn("[Chatbot] Knowledge base file not found at:", KNOWLEDGE_BASE_PATH);
            }

            if (fs.existsSync(SKILL_INSTRUCTIONS_PATH)) {
                skillInstructions = fs.readFileSync(SKILL_INSTRUCTIONS_PATH, 'utf8');
            } else {
                console.warn("[Chatbot] Skill instructions file not found at:", SKILL_INSTRUCTIONS_PATH);
            }
        } catch (e) {
            console.error("[Chatbot] File read error:", e.message);
        }

        // SYSTEM PROMPT
        const systemPrompt = `
        INSTRUCCIONES DE COMPORTAMIENTO:
        ${skillInstructions}
        
        CONOCIMIENTOS DE LA CLÍNICA:
        ${knowledgeBase}
        
        REGLAS DE ORO:
        - Si el usuario pregunta por brackets u ortodoncia, recalca que la Valoración Clínica ($15) es OBLIGATORIA.
        - Sé empático y profesional. Usa "estimada/o", "con mucho gusto" y "turnito".
        - Responde siempre en español.
        
        FLUJO DE CITA:
        1. Pregunta el Nombre Completo.
        2. Pregunta el servicio deseado.
        3. Pide fecha y hora preferida.
        4. Confirma el "turnito".
        
        IMPORTANTE: Si detectas una solicitud de cita con fecha y hora, incluye al final del mensaje: [DATE: YYYY-MM-DD] [TIME: HH:MM].
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Mensaje de WhatsApp del número ${phoneNumber}: ${messageText}` }
        ]);

        const response = result.response.text();
        console.log(`[Chatbot] AI Response generated: ${response.substring(0, 50)}...`);

        // Log activity to Database
        await logActivity(phoneNumber, messageText, response);

        // Send back via WhatsApp
        await sendWhatsAppMessage(phoneNumber, response);

        return { success: true };
    } catch (error) {
        console.error("[Chatbot] Error in processChatbotMessage:", error);
        throw error;
    }
}

/**
 * Database-based logging
 */
async function logActivity(phone, userMsg, botResp) {
    try {
        await ensureLogTable();
        await db.execute(
            'INSERT INTO chatbot_logs (phone, user_msg, bot_resp) VALUES (?, ?, ?)',
            [phone, userMsg, botResp]
        );
        console.log(`[Chatbot] Logged activity for ${phone}`);
    } catch (e) {
        console.error("[Chatbot] Database Log Error:", e.message);
    }
}
