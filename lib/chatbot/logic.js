import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import db from '../db'; // Using relative path for DB pool
import { checkAvailability, bookAppointment } from './scripts/calendar_helper.js';
import { sendWhatsAppMessage } from './scripts/whatsapp_template.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Paths - Using process.cwd() for absolute resolution on Vercel
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
        if (!err.message.includes('already exists')) {
            console.error("Error ensuring log table:", err.message);
        }
    }
}

/**
 * Main AI logic for the Dental Chatbot using OpenAI.
 */
export async function processChatbotMessage(phoneNumber, messageText, clinicNumber = null) {
    console.log(`[Chatbot Logic] Starting OpenAI flow for ${phoneNumber} (Clinic: ${clinicNumber})`);

    try {
        let knowledgeBase = "No information available.";
        let skillInstructions = "Be a helpful dental assistant.";

        try {
            if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
                knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
            }
            if (fs.existsSync(SKILL_INSTRUCTIONS_PATH)) {
                skillInstructions = fs.readFileSync(SKILL_INSTRUCTIONS_PATH, 'utf8');
            }
        } catch (e) {
            console.error("[Chatbot Logic] File read error:", e.message);
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

        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is missing in environment variables.");
        }

        // --- CONVERSATION MEMORY (Last 5 messages) ---
        let history = [];
        try {
            await ensureLogTable();
            const [rows] = await db.execute(
                'SELECT user_msg, bot_resp FROM chatbot_logs WHERE phone = ? ORDER BY timestamp DESC LIMIT 5',
                [phoneNumber]
            );
            // Reverse to get chronological order
            rows.reverse().forEach(row => {
                history.push({ role: "user", content: row.user_msg });
                history.push({ role: "assistant", content: row.bot_resp });
            });
        } catch (memError) {
            console.error("[Chatbot Logic] Memory retrieval error:", memError.message);
        }

        const messages = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: messageText }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.7,
        });

        const botResponse = response.choices[0].message.content;
        console.log(`[Chatbot Logic] OpenAI Response generated successfully. Memory: ${history.length / 2} pairs.`);

        // Log activity to Database
        await logActivity(phoneNumber, messageText, botResponse);

        // Send back via WhatsApp
        await sendWhatsAppMessage(phoneNumber, botResponse, clinicNumber);

        return { success: true };
    } catch (error) {
        console.error("[Chatbot Logic] CRITICAL ERROR (OpenAI):", error.message);
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
        console.log(`[Chatbot Logic] Activity Logged in DB.`);
    } catch (e) {
        console.error("[Chatbot Logic] Database Log Error:", e.message);
    }
}
