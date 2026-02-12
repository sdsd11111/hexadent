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

        // --- NEW TABLES FOR ROBUST DEBOUNCING & LOCKING ---
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

        // --- AUTO-CLEANUP ROUTINE (Hardening) ---
        // 1. Keep chat logs for 30 days
        await db.execute("DELETE FROM chatbot_logs WHERE timestamp < NOW() - INTERVAL 30 DAY");
        // 2. Clean up expired temporary slot locks (> 5 mins)
        await db.execute("DELETE FROM chatbot_locked_slots WHERE locked_at < NOW() - INTERVAL 5 MINUTE");
        // 3. Clean up old debouncer locks (> 5 mins)
        await db.execute("DELETE FROM chatbot_locks WHERE locked_at < NOW() - INTERVAL 5 MINUTE");

        // 2. Keep anti-spam buffer for 24 hours
        await db.execute("DELETE FROM chatbot_buffer WHERE created_at < NOW() - INTERVAL 24 HOUR");

        // 3. Keep sessions for 60 days (optional, to force fresh context eventually)
        // await db.execute("DELETE FROM chatbot_sessions WHERE updated_at < NOW() - INTERVAL 60 DAY");

        tablesReady = true;
    } catch (err) {
        console.error("[Chatbot Logic] Table Init/Cleanup Error (Proceeding anyway):", err.message);
    }
}

/**
 * Main AI logic for the Dental Chatbot.
 */
export async function processChatbotMessage(phoneNumber, messageData, clinicNumber = null) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    let messageText = "";

    // --- 1. MEDIA TYPE HANDLING ---
    if (typeof messageData === 'string') {
        messageText = messageData;
    } else if (typeof messageData === 'object') {
        // Check for Audio
        if (messageData.audioMessage || (messageData.message && messageData.message.audioMessage)) {
            console.log(`[Chatbot Logic] Audio detected from ${cleanPhone}. Transcribing...`);
            try {
                // Assumption: messageData.base64 is populated by the webhook controller
                if (messageData.base64) {
                    messageText = await transcribeAudio(messageData.base64);
                    console.log(`[Chatbot Logic] Audio transcribed: "${messageText}"`);
                } else {
                    await sendEvolutionWhatsApp(cleanPhone, "Lo siento, no pude escuchar ese audio (falta datos). Por favor escríbeme.");
                    return;
                }
            } catch (err) {
                console.error("[Logic] Transcription failed:", err);
                await sendEvolutionWhatsApp(cleanPhone, "Hubo un error al procesar tu audio. Por favor escríbeme en texto.");
                return;
            }

            // Hardening: Check for noise or short hallus
            const lowerText = (messageText || "").toLowerCase();
            if (messageText.length < 3 || lowerText.includes("gracias por ver") || lowerText.includes("subtítulos") || lowerText.includes("share on facebook")) {
                console.warn(`[Logic] Short/Strange transcription from ${cleanPhone}: "${messageText}"`);
                await sendEvolutionWhatsApp(cleanPhone, "Lo siento, no pude entender claramente lo que dijiste por el ruido ambiental o falta de volumen. ¿Podrías repetirlo o escribirme? 😊");
                return;
            }
        }
        // Check for Image/Video/Sticker
        else if (messageData.imageMessage || messageData.videoMessage || messageData.stickerMessage ||
            (messageData.message && (messageData.message.imageMessage || messageData.message.videoMessage || messageData.message.stickerMessage))) {
            await sendEvolutionWhatsApp(cleanPhone, "Lo siento, no puedo ver fotos, videos ni stickers. Por favor escríbeme lo que necesitas en texto. 📝");
            return;
        }
        else {
            // Fallback to text if present
            messageText = messageData.conversation || messageData.text || "";
        }
    }

    if (!messageText) return; // Nothing to process

    console.log(`[Chatbot Logic v12:30] Processing message for ${cleanPhone}`);

    try {
        await ensureTables();
        await ensureSessionTable();

        // --- 0. CHECK IGNORED NUMBERS & HANDOFF SESSIONS ---

        // --- 0. CHECK IGNORED NUMBERS & HANDOFF SESSIONS ---
        const [ignored] = await db.execute('SELECT 1 FROM ignored_numbers WHERE phone = ?', [cleanPhone]);
        if (ignored.length > 0) return { success: true, ignored: true };

        const [handedOff] = await db.execute(
            'SELECT 1 FROM handoff_sessions WHERE phone = ? AND created_at > NOW() - INTERVAL 48 HOUR',
            [cleanPhone]
        );
        if (handedOff.length > 0 && cleanPhone !== '593963410409') { // Temporary bypass for testing
            console.log(`[Chatbot Logic] Skipping handed-off session for: ${cleanPhone}`);
            return { success: true, handedOff: true };
        }

        // --- 1. LOAD CONTEXT & KNOWLEDGE ---
        let knowledgeBase = "";
        let personalityGuide = "";
        let trainingExamples = [];
        let skillInstructions = "";
        let bookingRules = "";
        let securityRules = "";
        let metadataRules = "";

        if (fs.existsSync(KNOWLEDGE_BASE_PATH)) knowledgeBase = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf8');
        if (fs.existsSync(PERSONALITY_GUIDE_PATH)) personalityGuide = fs.readFileSync(PERSONALITY_GUIDE_PATH, 'utf8');
        if (fs.existsSync(BOOKING_RULES_PATH)) bookingRules = fs.readFileSync(BOOKING_RULES_PATH, 'utf8');
        if (fs.existsSync(SECURITY_RULES_PATH)) securityRules = fs.readFileSync(SECURITY_RULES_PATH, 'utf8');
        if (fs.existsSync(METADATA_RULES_PATH)) metadataRules = fs.readFileSync(METADATA_RULES_PATH, 'utf8');
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
        let session = await getSession(cleanPhone);
        if (!session) {
            session = { name: null, cedula: null, age: null, target_date: null, target_time: null, duration: 20, current_flow: 'Nuevo', metadata: null };
        }

        let patientContext = session ? `PACIENTE REGISTRADO: ${session.name || 'No identificado'} (Cédula: ${session.cedula || 'Pendiente'}, Edad: ${session.age || 'Pendiente'})` : "PACIENTE REGISTRADO: No identificado aún";
        if (session && session.target_date) {
            patientContext += `\n- Fecha seleccionada previamente: ${session.target_date} a las ${session.target_time || 'pendiente'} (${session.duration || 20} min)`;
        }
        if (session && session.current_flow) {
            patientContext += `\n- Estado del flujo: ${session.current_flow}`;
        }

        // --- 2. GET CURRENT TIME (Guayaquil -5) ---
        // Use ISO-safe string for Ecuador Now
        const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "America/Guayaquil" }).replace(' ', 'T');
        const now = new Date(nowStr + "-05:00");
        const dateStr = nowStr.split('T')[0];
        const timeStr = nowStr.split('T')[1].substring(0, 5); // HH:MM
        const dayEcu = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(now);
        const earliestPossible = new Date(now.getTime() + (24 * 60 * 60 * 1000));

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
        const [allBlockedRows] = await db.execute('SELECT blocked_date, reason FROM blocked_dates WHERE blocked_date >= ?', [dateStr]);
        const blockedDatesText = allBlockedRows.length > 0
            ? allBlockedRows.map(b => `- ${b.blocked_date.toISOString().split('T')[0]}: ${b.reason || 'Cerrado'}`).join('\n')
            : "No hay fechas bloqueadas próximas.";

        let availabilityContext = "";
        let toolExecutionResult = "";
        let bookingExecuted = false; // Flag to prevent duplicate bookings

        const lowerMsg = messageText.toLowerCase();

        if (lowerMsg.includes('debug-reveal')) {
            try {
                // Check Env Vars Only
                const dump = `SISTEMA INTERNO ACTIVO:\nTablas: appointments, blocked_dates\nCitas agendadas: (Conexión OK)`;


                history = [{ role: "system", content: "INSTRUCCIÓN IMPERATIVA: EL USUARIO QUIERE VER EL ESTADO DEL SISTEMA. RESPONDE LITERALMENTE CON EL SIGUIENTE TEXTO:" }];
                availabilityContext = dump;
                toolExecutionResult = dump;
            } catch (e) {
                const errDump = `DEBUG ERROR: ${e.message}`;
                history = [{ role: "system", content: "ERROR." }];
                availabilityContext = errDump;
                toolExecutionResult = errDump;
            }
        }

        let slots = [];
        let targetDate = null;

        // If the user clearly wants to book or check, OR is confirming a previously discussed date
        const isDateConfirmation = (lowerMsg.includes('sí') || lowerMsg.includes('si') || lowerMsg.includes('está bien') || lowerMsg.includes('estaria bien') || lowerMsg.includes('perfecto') || lowerMsg.includes('acepto')) && session?.target_date;
        const isExplicitBookingIntent = lowerMsg.includes('cita') || lowerMsg.includes('disponibilidad') || lowerMsg.includes('cuándo') || lowerMsg.includes('horario') || lowerMsg.includes('cuanto') || lowerMsg.includes('hay') || lowerMsg.includes('se puede') || lowerMsg.includes('tienes espacio') || lowerMsg.includes('puedo ir') || lowerMsg.includes('agendar') || lowerMsg.includes('reservar') || lowerMsg.includes('agenda') || lowerMsg.includes('reserva');

        if (!lowerMsg.includes('debug-reveal') && (isExplicitBookingIntent || isDateConfirmation)) {
            // Anchor anchor for resolveDate
            const anchorForResolve = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            const resolved = resolveDate(messageText, anchorForResolve);
            targetDate = resolved || session?.target_date || dateStr; // Fallback to session or today if nothing found

            // Absolute Truth block for AI
            const dateTruthBlock = getDateTruth(targetDate, now);
            const isConfirmationMsg = lowerMsg.includes('sí') || lowerMsg.includes('si') || lowerMsg.includes('acepto') || lowerMsg.includes('perfecto') || lowerMsg.includes('está bien');

            // Detect duration based on treatment synonyms (Sum up if multiple mentioned)
            const isOrthoTreatment = lowerMsg.includes('control') || lowerMsg.includes('ajuste') || lowerMsg.includes('ligas');
            const isOrthoEval = lowerMsg.includes('bracket') || lowerMsg.includes('frenillo') || lowerMsg.includes('ortodoncia') || lowerMsg.includes('valoración') || lowerMsg.includes('valoracion') || lowerMsg.includes('ponerme brackets') || lowerMsg.includes('colocarme brackets');
            const isPediatric = lowerMsg.includes('niño') || lowerMsg.includes('niña') || lowerMsg.includes('hijo') || lowerMsg.includes('hija') || lowerMsg.includes('bebé') || lowerMsg.includes('bebe') || lowerMsg.includes('pequeñ') || lowerMsg.includes('infantil') || lowerMsg.includes('menor');
            const isGeneral = lowerMsg.includes('cero caries') || lowerMsg.includes('caries') || lowerMsg.includes('limpieza') || lowerMsg.includes('calza') || lowerMsg.includes('evaluación') || lowerMsg.includes('evaluacion') || lowerMsg.includes('chequeo') || lowerMsg.includes('consulta general') || lowerMsg.includes('dolor') || lowerMsg.includes('molestia') || lowerMsg.includes('revisión') || lowerMsg.includes('revision') || lowerMsg.includes('chequeo general') || lowerMsg.includes('odontología general') || lowerMsg.includes('médico') || lowerMsg.includes('curación') || lowerMsg.includes('empaste');

            let duration = 20; // Default Standard: 20 min
            const hasMotive = isOrthoTreatment || isOrthoEval || isPediatric || isGeneral || lowerMsg.includes('cita para') || lowerMsg.includes('consulta de');

            if (isPediatric) duration = 60;
            else if (isOrthoTreatment) duration = 45;
            else if (isOrthoEval || isGeneral) duration = 20;

            console.log(`[Chatbot Logic] detected Motive: ${hasMotive}, Duration: ${duration}`);

            const hasRegisteredMotive = session && session.current_flow.includes('Motivo recibido');

            if (hasMotive || hasRegisteredMotive) {
                try {
                    slots = await getAvailableSlots(targetDate, duration, cleanPhone);
                    if (hasMotive) session.current_flow = "Motivo recibido";
                } catch (e) {
                    console.error(`[Chatbot Logic] Error getting slots: ${e.message}`);
                    toolExecutionResult = `[SISTEMA: Error obteniendo disponibilidad: ${e.message}]`;
                }
            } else {
                availabilityContext = `${dateTruthBlock}\n[BLOQUEO DE FLUJO: EL MOTIVO DE CONSULTA ES OBLIGATORIO ANTES DE VER HORARIOS. El usuario aún no lo ha dicho claramente. NO SUGIERAS NINGÚN HORARIO NI CONFIRMES NADA. Pregunta cortésmente el motivo para poder calcular la duración.]`;
            }

            let dayNameEcu = "Día desconocido";
            if (targetDate && targetDate !== '9999-99-99') {
                try {
                    dayNameEcu = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(new Date(`${targetDate}T12:00:00-05:00`));
                } catch (e) {
                    console.warn(`[Chatbot Logic] Invalid date for dayNameEcu: ${targetDate}`);
                }
            }

            const hasActiveMotive = hasMotive || hasRegisteredMotive;

            if (hasActiveMotive) {
                // Check if day is blocked
                const [isBlocked] = await db.execute('SELECT reason FROM blocked_dates WHERE blocked_date = ?', [targetDate]);

                if (isBlocked.length > 0) {
                    const reason = isBlocked[0].reason || "Día no laborable";
                    availabilityContext = `${dateTruthBlock}\n[ESTADO: CERRADO. La clínica está CERRADA el ${dayNameEcu.toUpperCase()} ${targetDate}. Motivo: ${reason}. NO PUEDES AGENDAR NADA PARA ESTE DÍA.]`;
                } else if (slots.length === 0 && targetDate !== '9999-99-99') {
                    // Check if it's today or in the past
                    const requestedDateStart = new Date(`${targetDate}T12:00:00-05:00`).getTime();
                    const nowTs = Date.now();
                    const leadLimitTs = nowTs + (24 * 60 * 60 * 1000);
                    console.log(`[Calendar Helper] 24h Check - Now: ${new Date(nowTs).toISOString()}, Limit: ${new Date(leadLimitTs).toISOString()}`);
                    const isToday = targetDate === new Date(nowTs - (5 * 60 * 60 * 1000)).toISOString().split('T')[0];

                    if (requestedDateStart < nowTs - (24 * 60 * 60 * 1000)) {
                        availabilityContext = `${dateTruthBlock}\n[ESTADO: FECHA PASADA. No se puede agendar en el pasado.]`;
                    } else if (isToday) {
                        availabilityContext = `${dateTruthBlock}\n[ESTADO: RECHAZO POR REGLA DE 24H. Hoy es ${targetDate} y no se puede agendar para hoy mismo. Sugiere mañana u otros días.]`;
                    } else {
                        availabilityContext = `${dateTruthBlock}\n[ESTADO: SIN DISPONIBILIDAD. No hay turnos libres para ${targetDate}. Esto puede ser porque el día está lleno o por el margen de las 24h. Ofrece otros días.]`;
                    }
                } else if (slots.length > 0) {
                    const dayOfWeek = new Date(`${targetDate}T12:00:00-05:00`).getDay();
                    const isSaturday = dayOfWeek === 6;
                    const afternoonStart = isSaturday ? 13 : 15;

                    const morningSlots = slots.filter(s => parseInt(s.split(':')[0]) < 13);
                    const afternoonSlots = slots.filter(s => parseInt(s.split(':')[0]) >= afternoonStart);

                    const listFormat = `☀️ MAÑANA: ${morningSlots.length > 0 ? morningSlots.join(' | ') : 'Sin turnos'}\n🌙 TARDE: ${afternoonSlots.length > 0 ? afternoonSlots.join(' | ') : 'Sin turnos'}`;

                    availabilityContext = `${dateTruthBlock}\nLISTA DE HORARIOS DISPONIBLES PARA EL ${dayNameEcu.toUpperCase()} ${targetDate} (Duración: ${duration}min):\n${listFormat}\n\n⚠️ REGLA: Presenta los horarios en bloques horizontales como se muestra arriba.`;
                } else if (!toolExecutionResult) {
                    const dayOfWeek = new Date(`${targetDate}T12:00:00-05:00`).getDay();
                    if (dayOfWeek === 0) {
                        availabilityContext = `${dateTruthBlock}\n[SISTEMA: CERRADO POR SER DOMINGO (${targetDate}). Di cortésmente que los domingos no atendemos y ofrece sábado o lunes.]`;
                    } else {
                        availabilityContext = `${dateTruthBlock}\n[SISTEMA: No hay turnos para esa duración el ${dayNameEcu.toUpperCase()} ${targetDate}. Sugiere otro día.]`;
                    }
                }
            } else {
                // If motive is missing, availabilityContext is already set to BLOQUEO DE FLUJO above.
            }

            // Persistence update: ONLY if motive exists. Otherwise, clear previous guesses.
            if (hasActiveMotive && targetDate && targetDate !== '9999-99-99') {
                session.target_date = targetDate;
                session.duration = duration;
            } else if (!hasActiveMotive) {
                // IMPORTANT: If no motive, we DO NOT remember the date as a "selected" one.
                session.target_date = null;
            }

            // Detect if user chose a time (e.g., "a las 15:00", "a las 5", "5:30 pm")
            const timeMatch = lowerMsg.match(/(\d{1,2})(?:[:h\s](\d{2}))?(\s*[ap]m)?/i);
            if (timeMatch && hasActiveMotive && session.target_date) {
                let hh = parseInt(timeMatch[1]);
                let mm = timeMatch[2] ? timeMatch[2] : "00";
                const ampm = timeMatch[3]?.toLowerCase().trim();

                // Simple AM/PM conversion
                if (ampm === 'pm' && hh < 12) hh += 12;
                if (ampm === 'am' && hh === 12) hh = 0;

                // Heuristic: If user says "5" and it's a workday, they likely mean 17:00 if 05:00 is not in slots
                if (!ampm && hh > 0 && hh <= 7) hh += 12;

                const proposedTime = `${hh.toString().padStart(2, '0')}:${mm}`;

                // CRITICAL: Verify this specific slot is available BEFORE asking for personal data
                const isSlotAvailable = slots.includes(proposedTime);

                if (isSlotAvailable) {
                    session.target_time = proposedTime;
                    await lockSlot(cleanPhone, session.target_date, proposedTime);
                    availabilityContext = `[SLOT VERIFICADO: ${proposedTime} está DISPONIBLE para el ${session.target_date}. Ahora pide los datos personales (Nombre, Cédula, Edad) si aún no los tienes. NO pidas confirmación todavía.]`;
                } else {
                    availabilityContext = `[SLOT NO DISPONIBLE: ${proposedTime} ya NO está libre para el ${session.target_date}. Ofrece otros horarios de la lista. NO pidas datos personales.]`;
                    session.target_time = null;
                }
            } else if (timeMatch) {
                let hh = parseInt(timeMatch[1]);
                let mm = timeMatch[2] ? timeMatch[2] : "00";
                session.target_time = `${hh.toString().padStart(2, '0')}:${mm}`;
            }



        }

        // --- 5. RESERVED FOR FUTURE LOGIC ---
        // (Eager booking logic removed to ensure mandatory Name, ID, Age collection)


        // Generate a literal reference calendar for the next 60 days
        const getReferenceCalendar = () => {
            const lines = [];
            let d = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            const formatter = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' });
            lines.push(`VERDAD CALENDARIO (Próximos 60 días):`);
            for (let i = 0; i < 60; i++) {
                const dStr = d.toISOString().split('T')[0];
                const dayDate = new Date(`${dStr}T12:00:00-05:00`);
                const dayIdx = dayDate.getDay();
                const dName = formatter.format(dayDate);
                const closureInfo = (dayIdx === 0) ? " (DOMINGO - CERRADO)" : (dayIdx === 6 ? " (SÁBADO - CIERRE 15:00)" : "");
                lines.push(`${dName} ${dStr}${closureInfo}`);
                d.setDate(d.getDate() + 1);
            }
            lines.push(`\nREGLA: NUNCA asumas un día. Si no está aquí o dudas, di solo la fecha numérica. Prohibido decir que 25 de febrero es jueves si aquí dice miércoles. CONFÍA CIEGAMENTE EN EL BLOQUE [VERDAD DE FECHA].`);
            lines.push(`\nREGLA DE ORO: SIEMPRE debes decir el nombre del día (ej: "Sábado 25 de julio") para que el paciente se ubique.`);
            return lines.join('\n');
        };

        // --- 6. SYSTEM PROMPT ---
        // --- 6. SYSTEM PROMPT ---
        const systemPrompt = `
        ${personalityGuide}

        **IDENTIDADDEL PACIENTE:**
        ${patientContext}

        ${securityRules}

        ${bookingRules}

        ${metadataRules}

        ${knowledgeBase}

        ${skillInstructions}

        CONTEXTO TEMPORAL:
        - Ciudad: Loja, Ecuador (UTC-5)
        - Fecha de hoy: ${dateStr} (${dayEcu})
        - Hora actual: ${timeStr}
        
        ⚠️ **SISTEMA DE VERDADES (PROHIBIDO ALUCINAR)**:
        1. **FECHAS LEJANAS**: Si un usuario pide una fecha lejana (ej: Julio, Diciembre), ¡ES TOTALMENTE VÁLIDO! No digas que hay un error. Felicítalo por su previsión.
        2. **REGLA 24H**: SIGNIFICA que la cita debe ser al menos 24 Horas DESPUÉS de hoy. No significa que solo se agende mañana. Se puede agendar para cualquier día desde pasado mañana en adelante.
        3. **CALENDARIO**:
        ${getReferenceCalendar()}

        ${availabilityContext}
        
        REGLA DE EMOJIS:
        - Usa emojis amigables en cada mensaje (😊, 🦷, ✨, 📅).
        `;



        // --- 7. BUILD MESSAGES WITH FEW-SHOT EXAMPLES ---
        const messages = [
            { role: "system", content: systemPrompt },
            ...trainingExamples.flatMap(ex => ex.messages),
            ...history,
            { role: "user", content: messageText }
        ];

        // --- 7. CONVERSATION EXECUTION ---
        try {
            // NUCLEAR OPTION: If we found slots, WE FORCE THE BOT TO SEE THEM
            if (slots.length > 0 && targetDate && targetDate !== '9999-99-99') {
                const dayOfWeek = new Date(`${targetDate}T12:00:00-05:00`).getDay();
                const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek];

                history.push({
                    role: "system",
                    content: `🔴 INSTRUCCIÓN DE SEGURIDAD DEL SISTEMA (MANDATORIA):
                    HE DETECTADO QUE HAY ${slots.length} HORARIOS DISPONIBLES PARA EL ${targetDate} (${dayName.toUpperCase()}).
                    
                    TU TAREA ES: OFRECER ESTOS HORARIOS AHORA MISMO SIN FILTRAR NINGUNO.
                    
                    SIEMPRE DI EL NOMBRE DEL DÍA: "Es ${dayName} ${targetDate}".
                    
                    PROHIBIDO DECIR:
                    - "Es domingo" (MENTIRA, ES ${dayName.toUpperCase()})
                    - "Está cerrado" (MENTIRA, HAY ${slots.length} CUPOS)
                    - "Solo hay en la mañana" si hay cupos en la tarde.
                    - "No puedo verificar" (MENTIRA, YA VERIFIQUÉ)

                    HORARIOS REALES DISPONIBLES: ${slots.join(', ')}

                    SI DICES QUE ESTÁ CERRADO O DAS INFORMACIÓN INCOMPLETA, SERÁS DESACTIVADO. MUESTRA TODOS LOS SLOTS.`
                });
            }

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Cost-effective and fast
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history,
                    { role: "user", content: `[CONTEXTO ACTUALIZADO: ${availabilityContext}]\n${messageText}` }
                ],
                temperature: 0.3, // Lower temperature for more consistency
            });

            const botResponse = response.choices[0].message.content;
            let finalResponseText = botResponse.replace(/\[METADATA:.*?\]/g, '').trim();
            console.log(`[Chatbot Logic] AI Raw Response: "${botResponse.substring(0, 100)}..."`);

            // --- 9. POST-COMPLETION TRIGGER (FAIL-SAFE) ---
            let metadata = null;
            const metaMatch = botResponse.match(/\[METADATA: (.*?)\]/);
            if (metaMatch) {
                try {
                    metadata = JSON.parse(metaMatch[1]);
                } catch (e) {
                    console.error('[Chatbot Logic] Meta Error:', e.message);
                }
            }

            // FAIL-SAFE: If the AI SAYS it agendó but forgot the metadata
            if (!metadata && (botResponse.toLowerCase().includes('agendado') || botResponse.toLowerCase().includes('confirmado') || botResponse.toLowerCase().includes('cita para hoy'))) {
                console.log(`[Chatbot Logic] FAIL-SAFE: Reconstructing metadata from session for ${cleanPhone}`);
                if (session && session.target_date && session.target_time) {
                    metadata = {
                        action: "create_appointment",
                        name: session.name || "Paciente",
                        cedula: session.cedula || "Pendiente",
                        age: session.age || 0,
                        date: session.target_date,
                        time: session.target_time,
                        duration: session.duration || 20
                    };
                    console.log(`[Chatbot Logic] Reconstructed Meta: ${JSON.stringify(metadata)}`);
                } else {
                    console.warn(`[Chatbot Logic] FAIL-SAFE failed: Missing date/time in session memory.`);
                }
            }

            if (!bookingExecuted && metadata && metadata.action === 'create_appointment') {
                const mName = metadata.name;
                const mCedula = metadata.cedula;
                const mAge = parseInt(metadata.age);
                const mIsPediatric = botResponse.toLowerCase().includes('niño') || botResponse.toLowerCase().includes('infantil') || botResponse.toLowerCase().includes('hijo');

                let validationError = null;

                if (!mName || !mCedula || !mAge || mCedula === "Pendiente") {
                    validationError = "Faltan datos obligatorios (Nombre, Cédula o Edad).";
                } else if (!validateCedula(mCedula)) {
                    const actualLength = mCedula.replace(/\D/g, '').length;
                    validationError = (actualLength !== 10)
                        ? `La cédula debe tener exactamente 10 dígitos (tú proporcionaste ${actualLength}).`
                        : "La cédula proporcionada no es válida según el registro oficial de Ecuador.";
                } else if (mAge > 120 || mAge < 0) {
                    validationError = "La edad proporcionada no es válida.";
                } else if (mIsPediatric && mAge > 15) {
                    validationError = `Estás agendando una cita infantil para alguien de ${mAge} años. Por favor confirma si es correcto.`;
                } else if (!mIsPediatric && mAge < 10 && mAge > 0) {
                    validationError = `Estás agendando una cita de adulto para un niño de ${mAge} años. Por favor verifica los datos.`;
                }

                if (validationError) {
                    console.log(`[Chatbot Logic] Validation Failed: ${validationError}`);
                    toolExecutionResult = `[ERROR DE VALIDACIÓN: ${validationError}]`;
                    finalResponseText = `Veo un pequeño problema: ${validationError}\n\nPor favor, facilítame el dato correcto para poder confirmar tu cita sin errores. 😊`;
                    bookingExecuted = true;
                } else {
                    const booking = await bookAppointment({
                        name: mName,
                        phone: cleanPhone,
                        cedula: mCedula,
                        age: mAge,
                        date: metadata.date,
                        time: metadata.time,
                        duration: metadata.duration || 20
                    });

                    console.log(`[Chatbot Logic] Booking Attempt:`, booking.success ? `SUCCESS (${booking.id})` : `FAILED (${booking.error})`);
                    toolExecutionResult = booking.success ? `SUCCESS (ID: ${booking.id})` : `FAILED: ${booking.error}`;

                    if (booking.success) {
                        await saveSession(cleanPhone, {
                            name: mName || null,
                            cedula: mCedula || null,
                            age: mAge || null,
                            current_flow: "Agendamiento completado",
                            metadata: null
                        });
                    } else {
                        // Overwrite final response if booking failed (e.g. date blocked or slot taken)
                        finalResponseText = `Lo siento, hubo un inconveniente de último momento: ${booking.error}\n\nPor favor, indícame otra fecha u hora que te convenga. 😊`;
                    }
                    bookingExecuted = true;
                }
            }

            // SAVE STATE (CHECKPOINT)
            if (!bookingExecuted) {
                await saveSession(cleanPhone, {
                    name: metadata?.name || session?.name || null,
                    cedula: metadata?.cedula || session?.cedula || null,
                    age: metadata?.age || session?.age || null,
                    target_date: session?.target_date || null,
                    target_time: metadata?.time || session?.target_time || null,
                    duration: session?.duration || 20,
                    current_flow: session?.current_flow || "En conversación",
                    metadata: metadata || null
                });
            }



            // --- 9. DETECT HANDOFF IN RESPONSE ---
            const isHandoff = botResponse.toLowerCase().includes('comunico con') ||
                botResponse.toLowerCase().includes('asistente') ||
                botResponse.toLowerCase().includes('pasaré el mando') ||
                botResponse.toLowerCase().includes('odontóloga');

            // Log original (with meta) and Send clean (no meta)
            await logActivity(cleanPhone, messageText, botResponse, toolExecutionResult);

            if (isHandoff) {
                console.log(`[Chatbot Logic] Handoff detected for ${cleanPhone}. Muting bot.`);
                await db.execute('INSERT IGNORE INTO handoff_sessions (phone) VALUES (?)', [cleanPhone]);
            }

            if (finalResponseText && finalResponseText.length > 0) {
                await sendEvolutionWhatsApp(phoneNumber, finalResponseText);
            } else {
                console.log(`[Chatbot Logic] Skipping empty response for ${cleanPhone} (Metadata-only message)`);
            }

            return { success: true };
        } catch (error) {
            console.error("[Chatbot Logic] Error:", error.message);
            throw error;
        }
    } catch (err) {
        console.error("[Chatbot Logic] Critical Error:", err);
    }
}

async function logActivity(phone, userMsg, botResp, toolResult = "") {
    try {
        await db.execute(
            'INSERT INTO chatbot_logs (phone, user_msg, bot_resp, tool_execution_result) VALUES (?, ?, ?, ?)',
            [phone, userMsg, botResp, toolResult]
        );
    } catch (e) {
        console.error("[Chatbot Logic] Log Error:", e.message);
    }
}
