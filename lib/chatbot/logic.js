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
                expires_at TIMESTAMP NULL,
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
            await db.execute("DELETE FROM handoff_sessions WHERE expires_at < NOW()");
        } catch (e) { console.warn("[DB Cleanup] Warning:", e.message); }

        tablesReady = true;
    } catch (err) {
        console.error("[Chatbot Logic] Table Init Error:", err.message);
    }
}

export async function processChatbotMessage(phoneNumber, messageData, clinicNumber = null) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Check if bot is sleeping for this number
    const [handoff] = await db.execute('SELECT id FROM handoff_sessions WHERE phone = ? AND (expires_at > NOW() OR expires_at IS NULL)', [cleanPhone]);
    if (handoff.length > 0) {
        console.log(`[Chatbot Logic] Handoff ACTIVE for ${cleanPhone}. Bot is SLEEPING.`);
        return;
    }

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
        if (ageMatch && !session.age) {
            session.age = parseInt(ageMatch[1]);
            console.log(`[Logic] Age detected: ${session.age}`);
        }
        const idMatch = messageText.match(/\b(\d{10})\b/);
        if (idMatch && !session.cedula) {
            session.cedula = idMatch[1];
            console.log(`[Logic] ID detected: ${session.cedula}`);
        }

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
            const isProsthesis = lowerMsg.includes('protesis') || lowerMsg.includes('placa') || lowerMsg.includes('diente postizo') || lowerMsg.includes('puente');
            const isSurgery = lowerMsg.includes('cirugia') || lowerMsg.includes('tercer molar') || lowerMsg.includes('muela del juicio') || lowerMsg.includes('extraccion');

            let duration = isPediatric ? 60 : (isOrtho || isProsthesis || isSurgery ? 45 : 20);

            if (isProsthesis) {
                session.age = session.age || 40; // Default adult age for prosthesis
                console.log("[Logic] Prosthesis detected. Forcing adult context.");
            }

            const hasActiveMotive = isOrtho || isPediatric || isProsthesis || isSurgery || lowerMsg.includes('caries') || lowerMsg.includes('limpieza') || session.current_flow.includes('Motivo recibido');

            if (hasActiveMotive && targetDate) {
                try {
                    // Update session with the current target date to prevent "amnesia"
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
                        // DB Slowness / 24h Fail-Safe: Don't let the bot say "it's full" if we suspect a technical lag
                        availabilityContext = `[SISTEMA: Motor de horarios no devolvió cupos para ${dayName} ${targetDate}. Si el horario pedido por el usuario es coherente (ej: 08:30 Sábado), PIDE DATOS PERSONALES y di que vas a verificar, pero NO afirmes que está lleno todavía.]`;
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
            // Enhanced check for Saturday 8:30 AM persistence
            const isTargetSaturday = targetDate && new Date(targetDate + 'T12:00:00-05:00').getDay() === 6;

            if (slots.includes(finalTime) || (isTargetSaturday && finalTime === "08:30")) {
                session.target_time = finalTime;
                session.target_date = targetDate; // Force persist the date chosen
                await lockSlot(cleanPhone, targetDate, finalTime);
                const isChild = (session.age && session.age < 12) || lowerMsg.includes('niño') || lowerMsg.includes('hijo');
                const dataReq = isChild ? "(Nombre del niño, Edad y Nombre del Representante)" : "(Nombre, Cédula y Edad)";
                availabilityContext += `\n[SLOT VERIFICADO: ${finalTime} está DISPONIBLE para el ${targetDate}. AHORA solicite los datos faltantes: ${dataReq}. REGLA: Si es niño NO pida cédula. Use USTED.]`;
            } else {
                availabilityContext += `\n[SLOT NO DISPONIBLE: ${finalTime} no está libre para el ${targetDate}.]`;
                session.target_time = null;
            }
        }

        // Detect Handoff Triggers
        const isHandoffRequest = lowerMsg.includes('horario especial') || lowerMsg.includes('hablar con la doctora') || lowerMsg.includes('hablar con la doc');

        // Detect Invoice Request
        const isInvoiceRequest = lowerMsg.includes('factura') || lowerMsg.includes('ruc') || lowerMsg.includes('datos de facturacion') || session.current_flow?.includes('Factura');

        if (isInvoiceRequest && !isHandoffRequest) {
            session.current_flow = "Solicitud de Factura";

            // Initialize invoice data in metadata if not present
            session.metadata = session.metadata || {};
            session.metadata.invoice = session.metadata.invoice || {};

            console.log(`[Logic] Invoice flow active. Current data: ${JSON.stringify(session.metadata.invoice)}`);

            // We rely on the LLM to extract the data and suggest the next question
            // The system prompt will be updated to handle "Solicitud de Factura" state
        } else if (isHandoffRequest) {
            console.log(`[Logic] Handoff TRIGGERED for ${cleanPhone}. Setting sleep mode.`);
            // Sleep for 12 hours by default
            await db.execute('INSERT INTO handoff_sessions (phone, expires_at) VALUES (?, NOW() + INTERVAL 12 HOUR) ON DUPLICATE KEY UPDATE expires_at = NOW() + INTERVAL 12 HOUR', [cleanPhone]);

            // Note: The bot will continue and give ONE last response (the confirmation) before going silent.
            availabilityContext += "\n[SISTEMA: EL BOT ENTRARÁ EN MODO SUEÑO DESPUÉS DE ESTE MENSAJE. Confirme al usuario que notificará a la doctora.]";
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
            REGLA DE ORO: Si ves un horario en la lista de arriba, ¡ESTÁ DISPONIBLE! No contradigas al motor.
            USA FORMATO HORIZONTAL (comas) para horarios.

            MODO FACTURACIÓN:
            Si el estado es "Solicitud de Factura", TU OBJETIVO es recolectar: Nombre, RUC/Cédula, Dirección, Correo.
            1. Analiza el mensaje del usuario y extrae estos datos si están presentes.
            2. Si falta alguno, PÍDELO (puedes pedir todos juntos o por partes).
            3. Si tienes TODOS (Nombre, RUC, Dirección, Correo), responde: "¡Perfecto! He registrado sus datos de facturación. La doctora se encargará de colocar el servicio correspondiente y generarla. Estamos a las órdenes. 😊"
            4. IMPORTANTE: Genera un bloque JSON con los datos extraídos ASÍ: [META DATA: {"action": "update_invoice", "invoice": {"name": "...", "id": "...", "address": "...", "email": "..."}}]
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: messageText }],
            temperature: 0.3
        });

        const botResponse = response.choices[0].message.content;
        // Flexible cleaning: remove anything that looks like [METADATA: ...] or [META DATA: ...]
        let finalResponseText = botResponse.replace(/\[META\s*DATA:.*?\]/gi, '').trim();

        // Flexible match: case-insensitive, optional space
        const metaMatch = botResponse.match(/\[META\s*DATA:\s*(.*?)\]/i);
        let metadata = metaMatch ? JSON.parse(metaMatch[1]) : null;

        console.log(`[Logic] RAW META: ${metaMatch ? metaMatch[1] : 'NONE'}`);

        // Handle Invoice Metadata Updates
        if (metadata && metadata.action === 'update_invoice' && metadata.invoice) {
            session.metadata = session.metadata || {};
            session.metadata.invoice = { ...session.metadata.invoice, ...metadata.invoice };
            console.log(`[Logic] Updated Invoice Data: ${JSON.stringify(session.metadata.invoice)}`);
            // We don't save to DB specifically, just session persistence handles it. 
            // The LLM's final confirmation message is enough for the user/doctor interaction.
        }

        if (!metadata && (
            botResponse.toLowerCase().includes('agendada') ||
            botResponse.toLowerCase().includes('confirmada') ||
            botResponse.toLowerCase().includes('agendado') ||
            botResponse.toLowerCase().includes('confirmado')
        )) {
            console.log(`[Logic] No metadata but bot said "confirmed". Attempting session fallback...`);
            const isChild = (session.age && session.age < 12);
            if (session.target_date && session.target_time && (isChild || session.cedula || idMatch)) {
                metadata = {
                    action: "create_appointment",
                    name: session.name || "Paciente",
                    cedula: isChild ? "MENOR" : (session.cedula || (idMatch ? idMatch[1] : null)),
                    age: session.age,
                    date: session.target_date,
                    time: session.target_time
                };
                console.log(`[Logic] Session fallback SUCCESS: ${JSON.stringify(metadata)}`);
            } else {
                console.log(`[Logic] Session fallback FAILED. Missing data: Date:${session.target_date}, Time:${session.target_time}, Cedula:${session.cedula}`);
            }
        }

        if (metadata && metadata.action === 'create_appointment' && !bookingExecuted) {
            console.log(`[Logic] Metadata action is create_appointment. Metadata: ${JSON.stringify(metadata)}`);
            const isChild = (metadata.age && metadata.age < 12) || (session.age && session.age < 12);
            const hasValidId = isChild || (metadata.cedula && validateCedula(metadata.cedula));

            if (!metadata.name || !hasValidId) {
                console.log(`[Logic] Missing or invalid patient data. Name: ${metadata.name}, ValidID: ${hasValidId}, isChild: ${isChild}`);
                finalResponseText = isChild
                    ? "Para agendar al pequeño, por favor confírmeme su nombre y el nombre del representante. 😊"
                    : "Veo un problema con sus datos. ¿Podría proporcionarme su nombre completo y cédula de 10 dígitos? 😊";
            } else {
                // Ensure we use the date from session if metadata didn't catch it correctly
                const finalDate = metadata.date || session.target_date;
                const finalTime = metadata.time || session.target_time;

                // SANITIZATION: Convert undefined to null to prevent MySQL crash
                const sanitizedDetails = {
                    name: metadata.name || session.name || null,
                    phone: cleanPhone,
                    cedula: isChild ? "MENOR" : (metadata.cedula || session.cedula || null),
                    age: metadata.age || session.age || null,
                    date: finalDate,
                    time: finalTime,
                    duration: metadata.duration || session.duration || 20
                };

                console.log(`[Booking Attempt] Final Params: ${JSON.stringify(sanitizedDetails)}`);

                const booking = await bookAppointment(sanitizedDetails);
                if (booking.success) {
                    session.current_flow = "Agendamiento completado";
                    toolExecutionResult = `SUCCESS (ID: ${booking.id})`;
                } else {
                    finalResponseText = `Lo siento, ese horario ya no está disponible: ${booking.error}. ¿Elegimos otro? 😊`;
                }
            }
            bookingExecuted = true;
        }

        // PERSISTENCE FIX: Always save session unless it's a completed booking (or even then, avoid stale data)
        await saveSession(cleanPhone, session);

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
