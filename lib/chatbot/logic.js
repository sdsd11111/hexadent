import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import db from '../db';
import { checkAvailability, getAvailableSlots, bookAppointment } from './scripts/calendar_helper.js';
import { sendWhatsAppMessage as sendEvolutionWhatsApp } from '../whatsapp/evolution.js';
import { getSession, saveSession, ensureSessionTable } from './sessions.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'knowledge_base.md');
const PERSONALITY_GUIDE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'personality_guide.md');
const TRAINING_EXAMPLES_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'training_examples.json');
const SKILL_INSTRUCTIONS_PATH = path.join(process.cwd(), 'Skills', 'DentalChatbot', 'SKILL.md');

let tablesReady = false;

async function ensureTables() {
    if (tablesReady) return;
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

        // --- NEW TABLES FOR ROBUST DEBOUNCING ---
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_buffer (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(50),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_locks (
                phone VARCHAR(50) PRIMARY KEY,
                locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        tablesReady = true;
    } catch (err) {
        console.error("[Chatbot Logic] Table Initialization Error (Proceeding anyway):", err.message);
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
        await ensureSessionTable();

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

        // --- 1.2 LOAD PERSISTENT SESSION ---
        const session = await getSession(cleanPhone);
        const patientContext = session ? `- Paciente Registrado: ${session.name} (Cédula: ${session.cedula})` : "- Paciente: No identificado aún";

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

        // Helper to resolve relative dates to YYYY-MM-DD
        const resolveDate = (text) => {
            const lowText = text.toLowerCase();
            const date = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // Ecuador Time

            if (lowText.includes('hoy')) {
                // Keep today
            } else if (lowText.includes('mañana') && !lowText.includes('pasado mañana')) {
                date.setDate(date.getDate() + 1);
            } else if (lowText.includes('pasado mañana')) {
                date.setDate(date.getDate() + 2);
            } else if (lowText.includes('lunes')) {
                const day = date.getDay();
                const diff = (day <= 1 ? 1 - day : 8 - day);
                date.setDate(date.getDate() + diff);
            } else if (lowText.includes('martes')) {
                const day = date.getDay();
                const diff = (day <= 2 ? 2 - day : 9 - day);
                date.setDate(date.getDate() + diff);
            } else if (lowText.includes('miércoles') || lowText.includes('miercoles')) {
                const day = date.getDay();
                const diff = (day <= 3 ? 3 - day : 10 - day);
                date.setDate(date.getDate() + diff);
            } else if (lowText.includes('jueves')) {
                const day = date.getDay();
                const diff = (day <= 4 ? 4 - day : 11 - day);
                date.setDate(date.getDate() + diff);
            } else if (lowText.includes('viernes')) {
                const day = date.getDay();
                const diff = (day <= 5 ? 5 - day : 12 - day);
                date.setDate(date.getDate() + diff);
            } else if (lowText.includes('sábado') || lowText.includes('sabado')) {
                const day = date.getDay();
                const diff = (day <= 6 ? 6 - day : 13 - day);
                date.setDate(date.getDate() + diff);
            } else if (lowText.includes('próximo') || lowText.includes('proximo')) {
                date.setDate(date.getDate() + 7);
            }

            return date.toISOString().split('T')[0];
        };

        const lowerMsg = messageText.toLowerCase();

        // If the user clearly wants to book or check
        if (lowerMsg.includes('cita') || lowerMsg.includes('disponibilidad') || lowerMsg.includes('cuándo') || lowerMsg.includes('horario') || lowerMsg.includes('cuanto') || lowerMsg.includes('hay')) {
            const targetDate = resolveDate(messageText);
            const slots = await getAvailableSlots(targetDate);
            availabilityContext = `INFO DE DISPONIBILIDAD PARA EL ${targetDate} (${messageText}): ${slots.length > 0 ? slots.join(', ') : 'No hay turnos disponibles para este día.'}`;
            console.log(`[Chatbot Logic] Context generated for ${targetDate}: ${availabilityContext}`);
        }

        // --- 5. DATA EXTRACTION FOR BOOKING (Option B) ---
        if ((lowerMsg.includes('si') || lowerMsg.includes('confirm') || lowerMsg.includes('correct')) && history.length > 0) {
            // Find the last message that contains confirmation metadata
            const lastMsgWithMeta = [...history].reverse().find(h => h.role === "assistant" && h.content.includes('[METADATA:'));

            if (lastMsgWithMeta) {
                const metaMatch = lastMsgWithMeta.content.match(/\[METADATA: (.*?)\]/);
                if (metaMatch) {
                    try {
                        const metadata = JSON.parse(metaMatch[1]);

                        if (metadata.action === 'confirm_details' || metadata.action === 'create_appointment') {
                            console.log(`[Chatbot Logic] Booking triggered via Metadata:`, metadata);

                            // Auto-save session data if present in metadata
                            if (metadata.name && metadata.cedula) {
                                await saveSession(cleanPhone, { name: metadata.name, cedula: metadata.cedula });
                            }

                            const booking = await bookAppointment({
                                name: metadata.name || "Paciente Web",
                                phone: cleanPhone,
                                cedula: metadata.cedula || "0",
                                date: metadata.date || dateStr,
                                time: metadata.time || "09:00"
                            });

                            toolExecutionResult = booking.success
                                ? `[SISTEMA: CITA GRABADA EN CALENDARIO CORRECTAMENTE. Avisar al usuario.]`
                                : `[SISTEMA: ERROR AL GRABAR EN CALENDARIO: ${booking.error}. Avisar al usuario que hubo un problema técnico.]`;
                        }
                    } catch (e) {
                        console.error('[Chatbot Logic] Metadata Parse Error:', e.message);
                    }
                }
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
        - ${patientContext}
        - Horarios Clínica: Lun-Vie (09:00-13:00, 15:00-18:30), Sáb (09:00-13:30), Dom (Cerrado)
        - ${availabilityContext}
        - ${toolExecutionResult}
        
        REGLAS DE MEMORIA:
        1. Si el paciente ya está registrado (${patientContext}), NO vuelvas a pedir su nombre ni su cédula. Úsalos directamente para la reserva.
        2. Si el usuario desea reagendar, asume que es el mismo paciente registrado arriba.
        
        REGLAS CRÍTICAS:
        1. NO digas "Un momento", "Permítame verificar" o frases de espera.
        2. EMPATÍA PRIMERO: Si el usuario menciona dolor o molestia, responde con empatía antes de pedir datos o sugerir horas.
        3. UNA PREGUNTA A LA VEZ: No mezcles preguntas (ej: no pidas día y si es adulto/niño a la vez).
        4. FLUJO DE DATOS: Primero acuerda el día y la hora. SOLO DESPUÉS de tener el horario fijo, pide el Nombre y la Cédula.
        5. LISTADO CORTO: Si ofreces horarios, da máximo 3 opciones claras.
        6. Si ya tienes todo confirmado y el sistema devolvió éxito en toolExecutionResult, avisa que la cita ya está grabada.
        7. Deriva a humano en urgencias, quejas o confusión repetitiva.
        8. METADATA ESTRUCTURADA (OBLIGATORIO):
           Al confirmar detalles o agendar, incluye siempre al final:
           [METADATA: {"action": "confirm_details"|"create_appointment", "name": "...", "cedula": "...", "date": "YYYY-MM-DD", "time": "HH:MM"}]
           Resuelve fechas relativas (hoy/mañana) a fechas reales YYYY-MM-DD. Hora en 24h.
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
        const cleanBotResponse = botResponse.replace(/\[METADATA:.*?\]/g, '').trim();

        // --- 9. DETECT HANDOFF IN RESPONSE ---
        const isHandoff = botResponse.toLowerCase().includes('comunico con') ||
            botResponse.toLowerCase().includes('asistente') ||
            botResponse.toLowerCase().includes('pasaré el mando') ||
            botResponse.toLowerCase().includes('odontóloga');

        // Log original (with meta) and Send clean (no meta)
        await logActivity(cleanPhone, messageText, botResponse);

        if (isHandoff) {
            console.log(`[Chatbot Logic] Handoff detected for ${cleanPhone}. Muting bot.`);
            await db.execute('INSERT IGNORE INTO handoff_sessions (phone) VALUES (?)', [cleanPhone]);
        }

        await sendEvolutionWhatsApp(phoneNumber, cleanBotResponse);

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
