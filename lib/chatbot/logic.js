import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import db from '../db';
import { checkAvailability, getAvailableSlots, bookAppointment } from './scripts/calendar_helper.js';
import { sendWhatsAppMessage as sendEvolutionWhatsApp } from '../whatsapp/evolution.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'knowledge_base.md');
const PERSONALITY_GUIDE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'personality_guide.md');
const TRAINING_EXAMPLES_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'training_examples.json');
const SKILL_INSTRUCTIONS_PATH = path.join(process.cwd(), 'Skills', 'DentalChatbot', 'SKILL.md');

async function ensureTables() {
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
        await db.execute(`
            CREATE TABLE IF NOT EXISTS handoff_sessions (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (err) {
        if (!err.message.includes('already exists')) {
            console.error("Error ensuring tables:", err.message);
        }
    }
}

/**
 * Main AI logic for the Dental Chatbot.
 */
export async function processChatbotMessage(phoneNumber, messageText, clinicNumber = null) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    console.log(`[Chatbot Logic] Processing ${cleanPhone}`);

    try {
        await ensureTables();

        // --- 0. CHECK IGNORED NUMBERS & HANDOFF SESSIONS ---
        const [ignored] = await db.execute('SELECT 1 FROM ignored_numbers WHERE phone = ?', [cleanPhone]);
        if (ignored.length > 0) return { success: true, ignored: true };

        const [handedOff] = await db.execute(
            'SELECT 1 FROM handoff_sessions WHERE phone = ? AND created_at > NOW() - INTERVAL 48 HOUR',
            [cleanPhone]
        );
        if (handedOff.length > 0) {
            console.log(`[Chatbot Logic] Skipping handed-off session for: ${cleanPhone}`);
            return { success: true, handedOff: true };
        }

        // --- 1. LOAD CONTEXT & KNOWLEDGE ---
        let knowledgeBase = "";
        let personalityGuide = "";
        let trainingExamples = [];
        let skillInstructions = "";

        if (fs.existsSync(KNOWLEDGE_BASE_PATH)) knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
        if (fs.existsSync(PERSONALITY_GUIDE_PATH)) personalityGuide = fs.readFileSync(PERSONALITY_GUIDE_PATH, 'utf8');
        if (fs.existsSync(TRAINING_EXAMPLES_PATH)) {
            try {
                const trainingData = JSON.parse(fs.readFileSync(TRAINING_EXAMPLES_PATH, 'utf8'));
                // Flatten all examples for few-shot learning
                trainingExamples = trainingData.flatMap(category => category.examples.slice(0, 3)); // Limit to 3 per category
            } catch (e) {
                console.error('[Chatbot] Error loading training examples:', e.message);
            }
        }
        if (fs.existsSync(SKILL_INSTRUCTIONS_PATH)) skillInstructions = fs.readFileSync(SKILL_INSTRUCTIONS_PATH, 'utf8');

        // --- 2. GET CURRENT TIME (Guayaquil -5) ---
        const now = new Date();
        const ecuadorTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        const dateStr = ecuadorTime.toISOString().split('T')[0];
        const timeStr = ecuadorTime.toISOString().split('T')[1].substring(0, 5);

        // --- 3. CONVERSATION MEMORY (Fetch early for tool logic) ---
        let history = [];
        const [rows] = await db.execute(
            'SELECT user_msg, bot_resp FROM chatbot_logs WHERE phone = ? ORDER BY timestamp DESC LIMIT 15',
            [cleanPhone]
        );
        rows.reverse().forEach(row => {
            history.push({ role: "user", content: row.user_msg });
            history.push({ role: "assistant", content: row.bot_resp });
        });

        // --- 4. DYNAMIC AVAILABILITY & INTENT DETECTION ---
        let availabilityContext = "";
        let toolExecutionResult = "";

        // Detect scheduling intent
        const lowerMsg = messageText.toLowerCase();
        const dateMatch = messageText.match(/(\d{4}-\d{2}-\d{2})/) || lowerMsg.match(/próximo lunes|mañana|lunes|martes|miércoles|jueves|viernes/);

        // If the user clearly wants to book or check
        if (lowerMsg.includes('cita') || lowerMsg.includes('disponibilidad') || lowerMsg.includes('cuándo') || lowerMsg.includes('horario')) {
            const targetDate = dateMatch ? (typeof dateMatch === 'string' ? dateMatch : dateMatch[0]) : dateStr;
            const slots = await getAvailableSlots(targetDate);
            availabilityContext = `HORARIOS DISPONIBLES PARA EL ${targetDate}: ${slots.length > 0 ? slots.join(', ') : 'No hay turnos disponibles.'}`;
        }

        // --- 5. DATA EXTRACTION FOR BOOKING ---
        if ((lowerMsg.includes('si') || lowerMsg.includes('confirm')) && history.length > 0) {
            const lastBotMsg = history[history.length - 1].content;
            if (lastBotMsg.includes('Confirmas') || lastBotMsg.includes('detalles')) {
                const fullHistory = history.map(h => h.content).join('\n');
                const name = fullHistory.match(/Nombre:\s*(.*)/)?.[1]?.trim() || "Paciente Web";
                const cedula = fullHistory.match(/Cédula:\s*(\d+)/)?.[1] || "0";
                const dateRaw = fullHistory.match(/Fecha:\s*(\d{4}-\d{2}-\d{2})/);
                const date = dateRaw ? dateRaw[1] : dateStr;
                const time = fullHistory.match(/Hora:\s*(\d{2}:\d{2})/)?.[1] || "09:00";

                const booking = await bookAppointment({
                    name,
                    phone: cleanPhone,
                    cedula,
                    date,
                    time
                });

                toolExecutionResult = booking.success
                    ? `[SISTEMA: CITA GRABADA EN CALENDARIO CORRECTAMENTE. Avisar al usuario.]`
                    : `[SISTEMA: ERROR AL GRABAR EN CALENDARIO: ${booking.error}. Avisar al usuario que hubo un problema técnico.]`;
            }
        }

        // --- 6. SYSTEM PROMPT ---
        const systemPrompt = `
        ${personalityGuide}
        
        ${knowledgeBase}
        
        CONTEXTO ACTUAL:
        - Ciudad: Loja, Ecuador (Zona Horaria UTC-5)
        - Fecha de hoy: ${dateStr}
        - Hora actual: ${timeStr}
        - Cliente ID (Teléfono): ${cleanPhone}
        - ${availabilityContext}
        - ${toolExecutionResult}
        
        REGLAS CRÍTICAS:
        1. NO digas "Un momento", "Permítame verificar" o frases de espera.
        2. Si ya tienes la información (Nombre, Cédula, Fecha/Hora), confirma la cita y avisa que ya está grabada (si el sistema devolvió éxito).
        3. Pide Nombre, Cédula y Edad en UN SOLO mensaje si te faltan para agendar.
        4. NUNCA hagas diagnósticos ni recomiendes medicamentos.
        5. SIEMPRE indica que los precios son aproximados.
        6. Deriva a humano en urgencias, quejas o confusión repetitiva.
        `;

        // --- 7. BUILD MESSAGES WITH FEW-SHOT EXAMPLES ---
        const messages = [
            { role: "system", content: systemPrompt },
            ...trainingExamples.flatMap(ex => ex.messages),
            ...history,
            { role: "user", content: messageText }
        ];

        // --- 8. OPENAI COMPLETION ---
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.7,
        });

        const botResponse = response.choices[0].message.content;

        // --- 9. DETECT HANDOFF IN RESPONSE ---
        const isHandoff = botResponse.toLowerCase().includes('comunico con') ||
            botResponse.toLowerCase().includes('asistente') ||
            botResponse.toLowerCase().includes('pasaré el mando') ||
            botResponse.toLowerCase().includes('odontóloga');

        // Log and Send
        await logActivity(cleanPhone, messageText, botResponse);

        if (isHandoff) {
            console.log(`[Chatbot Logic] Handoff detected for ${cleanPhone}. Muting bot.`);
            await db.execute('INSERT IGNORE INTO handoff_sessions (phone) VALUES (?)', [cleanPhone]);
        }

        await sendEvolutionWhatsApp(phoneNumber, botResponse);

        return { success: true };
    } catch (error) {
        console.error("[Chatbot Logic] Error:", error.message);
        throw error;
    }
}

async function logActivity(phone, userMsg, botResp) {
    try {
        await db.execute(
            'INSERT INTO chatbot_logs (phone, user_msg, bot_resp) VALUES (?, ?, ?)',
            [phone, userMsg, botResp]
        );
    } catch (e) {
        console.error("[Chatbot Logic] Log Error:", e.message);
    }
}
