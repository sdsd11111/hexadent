import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { checkAvailability, bookAppointment } from './scripts/calendar_helper';
import { sendWhatsAppMessage } from './scripts/whatsapp_template';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Paths to Skill documentation - Using absolute paths from process.cwd() for Vercel
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'knowledge_base.md');
const SKILL_INSTRUCTIONS_PATH = path.join(process.cwd(), 'Skills', 'DentalChatbot', 'SKILL.md');

// Database pool for logging
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

async function ensureLogTable() {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS chatbot_logs (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            phone VARCHAR(50),
            user_msg TEXT,
            bot_resp TEXT
        )
    `).catch(err => console.error("Error creating log table:", err));
}

/**
 * Main AI logic for the Dental Chatbot.
 */
export async function processChatbotMessage(phoneNumber, messageText) {
    try {
        let knowledgeBase = "No KB found";
        let skillInstructions = "No Skill found";

        try {
            if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
                knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
            }
            if (fs.existsSync(SKILL_INSTRUCTIONS_PATH)) {
                skillInstructions = fs.readFileSync(SKILL_INSTRUCTIONS_PATH, 'utf8');
            }
        } catch (e) {
            console.error("File read error in Chatbot:", e.message);
        }

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

        // Log activity to Database
        await logActivity(phoneNumber, messageText, response);

        // Send back via WhatsApp
        await sendWhatsAppMessage(phoneNumber, response);

        return { success: true };
    } catch (error) {
        console.error("Chatbot Logic Error:", error);
        throw error;
    }
}

/**
 * Database-based logging for the Admin dashboard
 */
async function logActivity(phone, userMsg, botResp) {
    try {
        await ensureLogTable();
        await pool.execute(
            'INSERT INTO chatbot_logs (phone, user_msg, bot_resp) VALUES (?, ?, ?)',
            [phone, userMsg, botResp]
        );
    } catch (e) {
        console.error("Database Log Error:", e.message);
    }
}
