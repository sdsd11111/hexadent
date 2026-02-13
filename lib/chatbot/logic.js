import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import db from '../db.js';
import { checkAvailability, getAvailableSlots, bookAppointment, lockSlot } from './scripts/calendar_helper.js';
import { sendWhatsAppMessage as sendEvolutionWhatsApp } from '../whatsapp/evolution.js';
import { getSession, saveSession, ensureSessionTable } from './sessions.js';
import { transcribeAudio } from './transcription.js';
import { validateCedula } from './utils/validation.js';
import { resolveDate, getDateTruth } from './utils/date_helper.js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'knowledge_base.md');
const PERSONALITY_GUIDE_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'personality_guide.md');
const TRAINING_EXAMPLES_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'training_examples.json');
const SKILL_INSTRUCTIONS_PATH = path.join(process.cwd(), 'Skills', 'DentalChatbot', 'SKILL.md');
const BOOKING_RULES_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'booking_rules.md');
const SECURITY_RULES_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'security_rules.md');
const METADATA_RULES_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'metadata_rules.md');

let tablesReady = false;

export async function ensureTables() {
    if (tablesReady) return;
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                phone VARCHAR(50),
                user_msg TEXT,
                bot_resp TEXT,
                tool_execution_result TEXT
            )
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS handoff_sessions (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(50) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
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
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_locked_slots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                time TIME NOT NULL,
                locked_by VARCHAR(50) NOT NULL,
                locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_slot (date, time)
            )
        `);

        // Auto-cleanup
        try {
            await db.execute("DELETE FROM chatbot_logs WHERE timestamp < NOW() - INTERVAL 30 DAY");
            await db.execute("DELETE FROM chatbot_locked_slots WHERE locked_at < NOW() - INTERVAL 5 MINUTE");
            await db.execute("DELETE FROM chatbot_locks WHERE locked_at < NOW() - INTERVAL 5 MINUTE");
            await db.execute("DELETE FROM chatbot_buffer WHERE created_at < NOW() - INTERVAL 24 HOUR");
        } catch (e) { console.warn("[DB Cleanup] Warning:", e.message); }

        tablesReady = true;
    } catch (err) {
        console.error("[Chatbot Logic] Table Init Error:", err.message);
    }
}

export async function processChatbotMessage(phoneNumber, messageData, clinicNumber = null) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    let messageText = "";

    const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "America/Guayaquil" }).replace(' ', 'T');
    const now = new Date(nowStr + "-05:00");
    const dateStr = nowStr.split('T')[0];
    const timeStr = nowStr.split('T')[1].substring(0, 5);
    const dayEcu = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(now);

    if (typeof messageData === 'string') {
        messageText = messageData;
    } else if (typeof messageData === 'object') {
        if (messageData.audioMessage || (messageData.message && messageData.message.audioMessage)) {
            try {
                if (messageData.base64) messageText = await transcribeAudio(messageData.base64);
                else { await sendEvolutionWhatsApp(cleanPhone, "No pude procesar el audio."); return; }
            } catch (err) { await sendEvolutionWhatsApp(cleanPhone, "Error en transcripción."); return; }
        } else {
            messageText = messageData.conversation || messageData.text || "";
        }
    }

    if (!messageText) return;

    try {
        await ensureTables();
        await ensureSessionTable();

        const [ignored] = await db.execute('SELECT 1 FROM ignored_numbers WHERE phone = ?', [cleanPhone]);
        if (ignored.length > 0) return { success: true };

        const [handedOff] = await db.execute('SELECT 1 FROM handoff_sessions WHERE phone = ? AND created_at > NOW() - INTERVAL 48 HOUR', [cleanPhone]);
        if (handedOff.length > 0 && cleanPhone !== '593963410409') return { success: true };

        let knowledgeBase = fs.existsSync(KNOWLEDGE_BASE_PATH) ? fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8') : "";
        let personalityGuide = fs.existsSync(PERSONALITY_GUIDE_PATH) ? fs.readFileSync(PERSONALITY_GUIDE_PATH, 'utf8') : "";
        let trainingExamples = [];
        if (fs.existsSync(TRAINING_EXAMPLES_PATH)) {
            trainingExamples = JSON.parse(fs.readFileSync(TRAINING_EXAMPLES_PATH, 'utf8')).flatMap(c => c.examples.slice(0, 3));
        }
        let skillInstructions = fs.existsSync(SKILL_INSTRUCTIONS_PATH) ? fs.readFileSync(SKILL_INSTRUCTIONS_PATH, 'utf8') : "";
        let bookingRules = fs.existsSync(BOOKING_RULES_PATH) ? fs.readFileSync(BOOKING_RULES_PATH, 'utf8') : "";
        let securityRules = fs.existsSync(SECURITY_RULES_PATH) ? fs.readFileSync(SECURITY_RULES_PATH, 'utf8') : "";
        let metadataRules = fs.existsSync(METADATA_RULES_PATH) ? fs.readFileSync(METADATA_RULES_PATH, 'utf8') : "";

        let session = await getSession(cleanPhone) || { name: null, cedula: null, age: null, target_date: null, target_time: null, duration: 20, current_flow: 'Nuevo', metadata: null };

        // NUCLEAR SAFETY VALVE: Kill March dates in February
        if (session.target_date && session.target_date.includes('-03-') && dateStr.includes('-02-')) {
            session.target_date = null; session.target_time = null;
        }

        const ageMatch = messageText.match(/(\d{1,3})\s*(?:años?|anos?)/i) || messageText.match(/(?:tengo|de)\s+(\d{1,3})/i);
        if (ageMatch && !session.age) session.age = parseInt(ageMatch[1]);
        const idMatch = messageText.match(/\b(\d{10})\b/);
        if (idMatch && !session.cedula) session.cedula = idMatch[1];

        let history = [];
        const [rows] = await db.execute('SELECT user_msg, bot_resp FROM chatbot_logs WHERE phone = ? ORDER BY timestamp DESC LIMIT 15', [cleanPhone]);
        rows.reverse().forEach(row => {
            history.push({ role: "user", content: row.user_msg });
            history.push({ role: "assistant", content: row.bot_resp });
        });

        const lowerMsg = messageText.toLowerCase();
        let availabilityContext = "";
        let toolExecutionResult = "";
        let bookingExecuted = false;
        let slots = [];
        let targetDate = session.target_date || null;

        const isCurrentlyInBookingFlow = session && session.target_date && session.current_flow !== 'Agendamiento completado';
        const isExplicitBooking = lowerMsg.includes('cita') || lowerMsg.includes('agendar') || lowerMsg.includes('horario') || lowerMsg.includes('disponibilidad');

        if (isExplicitBooking || isCurrentlyInBookingFlow) {
            const resolved = resolveDate(messageText, now);
            targetDate = resolved || session.target_date || dateStr;
            if (targetDate instanceof Date) targetDate = targetDate.toISOString().split('T')[0];

            const isOrtho = lowerMsg.includes('bracket') || lowerMsg.includes('frenillo') || lowerMsg.includes('ortodoncia');
            const isPediatric = lowerMsg.includes('niño') || lowerMsg.includes('hijo') || lowerMsg.includes('infantil');
            let duration = isPediatric ? 60 : (isOrtho ? 20 : 20);

            const hasActiveMotive = isOrtho || isPediatric || lowerMsg.includes('caries') || lowerMsg.includes('limpieza') || session.current_flow.includes('Motivo recibido');

            if (hasActiveMotive && targetDate) {
                try {
                    // PERSIST TO SESSION IMMEDIATELY
                    session.target_date = targetDate;
                    session.duration = duration;

                    slots = await getAvailableSlots(targetDate, duration, cleanPhone);
                    session.current_flow = "Motivo recibido";

                    const [isBlockedRows] = await db.execute('SELECT reason FROM blocked_dates WHERE blocked_date = ?', [targetDate]);
                    const dayName = new Intl.DateTimeFormat('es-EC', { weekday: 'long' }).format(new Date(targetDate + 'T12:00:00-05:00'));

                    if (isBlockedRows.length > 0) {
                        availabilityContext = `[ESTADO: CERRADO. Motivo: ${isBlockedRows[0].reason || 'Cerrado'}]`;
                    } else if (slots.length > 0) {
                        availabilityContext = `⚠️ HORARIOS REALES DISPONIBLES (${dayName} ${targetDate}): ${slots.join(', ')}`;
                    } else {
                        // DB Slowness / 24h Fail-Safe
                        availabilityContext = `[ADVERTENCIA: Motor de horarios no devolvió cupos. Si es ${dayName} y el horario pedido es coherente (ej: 08:30 Sab), PROCEDE CON CAUTELA pero no niegues tajantemente.]`;
                    }
                } catch (e) { console.error("Slots Error:", e); }
            } else {
                availabilityContext = "[BLOQUEO DE FLUJO: Pregunta el motivo de consulta para ver horarios.]";
            }
        }

        // Detect Time Selection
        const timePatterns = /(?:a\s+las\s+)?(\d{1,2})(?:\s*[:h\s.\-y]\s*(\d{2}))?(\s*[ap]m)?/gi;
        let m, bestMatch = null, proposedTime = null;
        while ((m = timePatterns.exec(lowerMsg)) !== null) {
            let hh = parseInt(m[1]), mm = m[2] ? m[2] : "00";
            const ampm = m[3]?.toLowerCase().trim();
            if (ampm === 'pm' && hh < 12) hh += 12;
            else if (!ampm && hh > 0 && hh <= 7) hh += 12;
            const testTime = `${hh.toString().padStart(2, '0')}:${mm}`;
            if (slots.includes(testTime)) { bestMatch = testTime; break; }
            if (!proposedTime) proposedTime = testTime;
        }

        if (bestMatch || proposedTime) {
            const finalTime = bestMatch || proposedTime;
            if (slots.includes(finalTime) || (targetDate && new Date(targetDate + 'T12:00:00-05:00').getDay() === 6 && finalTime === "08:30")) {
                session.target_time = finalTime;
                session.target_date = targetDate; // Double check persistence
                await lockSlot(cleanPhone, targetDate, finalTime);
                availabilityContext += `\n[SLOT VERIFICADO: ${finalTime} está DISPONIBLE para el ${targetDate}. Pide datos personales Nombre/Cédula/Edad.]`;
            } else {
                availabilityContext += `\n[SLOT NO DISPONIBLE: ${finalTime} no está libre para el ${targetDate}.]`;
                session.target_time = null;
            }
        }

        const patientContext = `PACIENTE: ${session.name || 'Desconocido'}, Cédula: ${session.cedula || 'Pendiente'}, Edad: ${session.age || 'Pendiente'}. Estado: ${session.current_flow}`;

        const systemPrompt = `
            ${personalityGuide}
            ${patientContext}
            ${securityRules}
            ${bookingRules}
            ${metadataRules}
            ${knowledgeBase}
            ${skillInstructions}
            HOY ES ${dayEcu} ${dateStr}. ESTAMOS EN FEBRERO.
            ${availabilityContext}
            REGLA DE ORO: Si ves un horario en la lista de arriba, ¡ESTÁ DISPONIBLE! No contradigas al motor.
            USA FORMATO HORIZONTAL (comas) para horarios.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: messageText }],
            temperature: 0.3
        });

        const botResponse = response.choices[0].message.content;
        let finalResponseText = botResponse.replace(/\[METADATA:.*?\]/g, '').trim();

        const metaMatch = botResponse.match(/\[METADATA: (.*?)\]/);
        let metadata = metaMatch ? JSON.parse(metaMatch[1]) : null;

        if (!metadata && (botResponse.toLowerCase().includes('agendado') || botResponse.toLowerCase().includes('confirmado'))) {
            if (session.target_date && session.target_time) {
                metadata = { action: "create_appointment", name: session.name, cedula: session.cedula, age: session.age, date: session.target_date, time: session.target_time };
            }
        }

        if (metadata && metadata.action === 'create_appointment' && !bookingExecuted) {
            if (!metadata.name || !metadata.cedula || !validateCedula(metadata.cedula)) {
                finalResponseText = "Veo un problema con tus datos. ¿Podrías darme tu nombre completo y cédula de 10 dígitos? 😊";
            } else {
                const booking = await bookAppointment({ ...metadata, phone: cleanPhone });
                if (booking.success) {
                    session.current_flow = "Agendamiento completado";
                    toolExecutionResult = `SUCCESS (ID: ${booking.id})`;
                } else {
                    finalResponseText = `Lo siento, ese horario ya no está disponible: ${booking.error}. ¿Elegimos otro? 😊`;
                }
            }
            bookingExecuted = true;
        }

        if (!bookingExecuted) await saveSession(cleanPhone, session);

        await logActivity(cleanPhone, messageText, botResponse, toolExecutionResult);
        await sendEvolutionWhatsApp(phoneNumber, finalResponseText);

        return { success: true };
    } catch (err) {
        console.error("Critical Logic Error:", err);
        return { success: false, error: err.message };
    }
}

async function logActivity(phone, userMsg, botResp, toolResult = "") {
    try {
        await db.execute('INSERT INTO chatbot_logs (phone, user_msg, bot_resp, tool_execution_result) VALUES (?, ?, ?, ?)', [phone, userMsg, botResp, toolResult]);
    } catch (e) { console.error("Log Error:", e.message); }
}
