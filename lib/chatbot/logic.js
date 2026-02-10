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
        const timeStr = ecuadorTime.getUTCHours().toString().padStart(2, '0') + ":" + ecuadorTime.getUTCMinutes().toString().padStart(2, '0');
        const dayEcu = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(now);

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
        let bookingExecuted = false; // Flag to prevent duplicate bookings

        const resolveDate = (text) => {
            const lowText = text.toLowerCase();
            // Use local date for anchoring relative terms like "mañana" relative to ECU time
            const anchor = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            const date = new Date(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate());

            // 0. Handle "en X semanas" or "en X dias"
            const weeksMatch = text.match(/en\s+(\d{1,2})\s+semana/i);
            if (weeksMatch) {
                date.setDate(date.getDate() + (parseInt(weeksMatch[1]) * 7));
                return date.toISOString().split('T')[0];
            }
            const daysMatch = text.match(/en\s+(\d{1,2})\s+d[ií]a/i);
            if (daysMatch) {
                date.setDate(date.getDate() + parseInt(daysMatch[1]));
                return date.toISOString().split('T')[0];
            }

            // 1. Handle "el 14" or "el 14 de febrero" or specific years
            const numericMatch = text.match(/el\s+(\d{1,2})(\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre))?(\s+del?\s+(\d{4}))?/i);
            if (numericMatch) {
                const dayNum = parseInt(numericMatch[1]);
                const monthName = numericMatch[3]?.toLowerCase();
                const yearNum = numericMatch[5] ? parseInt(numericMatch[5]) : date.getFullYear();

                const months = {
                    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
                    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
                };

                if (monthName) {
                    const monthIdx = months[monthName];
                    const testDate = new Date(yearNum, monthIdx, dayNum);
                    if (testDate.getMonth() !== monthIdx) return "9999-99-99";
                    date.setFullYear(yearNum);
                    date.setMonth(monthIdx);
                } else {
                    if (dayNum < date.getDate()) {
                        date.setMonth(date.getMonth() + 1);
                    }
                    const testDate = new Date(date.getFullYear(), date.getMonth(), dayNum);
                    if (testDate.getDate() !== dayNum) return "9999-99-99";
                }
                date.setDate(dayNum);
                return date.toISOString().split('T')[0];
            }

            // 2. Relative logic (hoy, mañana, días de la semana, próximo)
            let extraDays = 0;
            if (lowText.includes('próximo') || lowText.includes('proximo') || lowText.includes('siguiente')) {
                extraDays = 7;
            }

            if (lowText.includes('pasado mañana')) date.setDate(date.getDate() + 2);
            else if (lowText.includes('mañana')) date.setDate(date.getDate() + 1);
            else {
                const dayMap = { 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0 };
                for (const [name, val] of Object.entries(dayMap)) {
                    if (lowText.includes(name)) {
                        const currentDay = date.getDay();
                        let diff = val - currentDay;
                        if (diff <= 0) diff += 7;
                        // Avoid double-adding 7 if diff is already 7
                        date.setDate(date.getDate() + diff + (extraDays === 7 && diff < 7 ? 7 : 0));
                        break;
                    }
                }
            }

            return date.toISOString().split('T')[0];
        };

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

        // If the user clearly wants to book or check
        if (!lowerMsg.includes('debug-reveal') && (lowerMsg.includes('cita') || lowerMsg.includes('disponibilidad') || lowerMsg.includes('cuándo') || lowerMsg.includes('horario') || lowerMsg.includes('cuanto') || lowerMsg.includes('hay') || lowerMsg.includes('se puede') || lowerMsg.includes('tienes espacio') || lowerMsg.includes('puedo ir') || lowerMsg.includes('agendar') || lowerMsg.includes('reservar') || lowerMsg.includes('agenda') || lowerMsg.includes('reserva'))) {
            const targetDate = resolveDate(messageText);

            // Detect duration based on treatment synonyms (Sum up if multiple mentioned)
            const isOrthoTreatment = lowerMsg.includes('control') || lowerMsg.includes('ajuste') || lowerMsg.includes('ligas');
            const isOrthoEval = lowerMsg.includes('bracket') || lowerMsg.includes('frenillo') || lowerMsg.includes('ortodoncia') || lowerMsg.includes('valoración') || lowerMsg.includes('valoracion');
            const isPediatric = lowerMsg.includes('niño') || lowerMsg.includes('niña') || lowerMsg.includes('hijo') || lowerMsg.includes('hija') || lowerMsg.includes('bebé') || lowerMsg.includes('bebe') || lowerMsg.includes('pequeñ');
            const isGeneral = lowerMsg.includes('caries') || lowerMsg.includes('limpieza') || lowerMsg.includes('calza') || lowerMsg.includes('evaluación') || lowerMsg.includes('evaluacion') || lowerMsg.includes('chequeo');

            let duration = 0;
            if (isPediatric) duration = 60;
            else if (isOrthoTreatment) duration = 45;
            else if (isOrthoEval || isGeneral) duration = 20;
            duration = 20; // Forced for now

            console.log(`[Chatbot Logic] requesting slots for Date: ${targetDate} with Duration: ${duration}`);
            let slots = [];
            try {
                slots = await getAvailableSlots(targetDate, duration);
            } catch (e) {
                console.error(`[Chatbot Logic] Error getting slots: ${e.message}`);
                toolExecutionResult = `[SISTEMA: Error obteniendo disponibilidad: ${e.message}]`;
            }

            // Explicit guard for the AI
            const isSaturday = new Date(`${targetDate}T00:00:00-05:00`).getDay() === 6;
            const requestedTimeMatch = messageText.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|am|p\.m|a\.m)?/i);
            let timeWarning = "";

            if (targetDate === "9999-99-99") {
                timeWarning = "\n⚠️ REGLA DE HARDENING: Fecha inexistente. RECHAZA.";
            } else if (targetDate < dateStr) {
                timeWarning = "\n⚠️ REGLA DE HARDENING: Fecha PASADA. RECHAZA.";
            }

            // Calculate the last possible start time for each session
            const morningLimit = 13;
            const afternoonLimit = isSaturday ? 15 : 18;

            const calcLast = (limitHour) => {
                const totalMins = (limitHour * 60) - duration;
                const hh = Math.floor(totalMins / 60);
                const mm = totalMins % 60;
                return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
            };

            const lastMorning = calcLast(morningLimit);
            const lastAfternoon = calcLast(afternoonLimit);

            const dayNameEcu = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(new Date(`${targetDate}T12:00:00-05:00`));

            let sessionInfo = `SESIÓN MAÑANA: 09:00 - 13:00 (Última cita a las ${lastMorning}).
            SESIÓN TARDE: 15:00 - 18:00 (Última cita a las ${lastAfternoon}).`;
            if (isSaturday) {
                sessionInfo = `SÁBADO (JORNADA ÚNICA): 08:30 - 15:00 (Última cita a las ${lastAfternoon}).`;
            }


            const morningSlots = slots.filter(s => parseInt(s.split(':')[0]) < 13);
            const afternoonSlots = slots.filter(s => parseInt(s.split(':')[0]) >= 15);

            availabilityContext = `LISTA DE HORARIOS DISPONIBLES PARA EL ${dayNameEcu} ${targetDate} (Mensaje: "${messageText}"):
            ☀️ MAÑANA: ${morningSlots.length > 0 ? morningSlots.join(', ') : 'Sin turnos'}
            🌙 TARDE: ${afternoonSlots.length > 0 ? afternoonSlots.join(', ') : 'Sin turnos'}
            
            [SYSTEM DEBUG DATA]:
            - Target Date: ${targetDate}
            - Duration: ${duration} min
            
            ⚠️ REGLA DE HARDENING (LUNCH BREAK):
            - ${sessionInfo}
            - Importante: El sistema ya validó los horarios de arriba. Preséntalos de forma organizada y estética.`;


            console.log(`[Chatbot Logic] Context generated for ${targetDate} (${duration}m): ${availabilityContext}`);
        }

        // --- 5. DATA EXTRACTION FOR BOOKING (Option B: Pre-completion trigger) ---
        // This triggers if the user says "si" and metadata was already pending
        if ((lowerMsg.includes('si') || lowerMsg.includes('confirm') || lowerMsg.includes('correct')) && history.length > 0) {
            const lastMsgWithMeta = [...history].reverse().find(h => h.role === "assistant" && h.content.includes('[METADATA:'));
            if (lastMsgWithMeta) {
                const metaMatch = lastMsgWithMeta.content.match(/\[METADATA: (.*?)\]/);
                if (metaMatch) {
                    try {
                        const metadata = JSON.parse(metaMatch[1]);
                        if (metadata.action === 'confirm_details' || metadata.action === 'create_appointment') {
                            // If we have enough data (already in metadata or in message), we can try to book
                            // Note: If data is missing, the AI will catch it in the prompt anyway.
                            const bookingName = metadata.name || "Paciente Web";
                            let bookingCedula = metadata.cedula || (messageText.match(/\d{5,12}/) ? messageText.match(/\d{5,12}/)[0] : "0");

                            if (bookingCedula !== "0" && bookingCedula.length !== 10) {
                                toolExecutionResult = `[SISTEMA: ERROR - La cédula ${bookingCedula} es inválida. Debe tener exactamente 10 dígitos. Pídela de nuevo.]`;
                                bookingCedula = "0"; // Reset to prevent booking
                            }

                            if (bookingCedula !== "0") {
                                console.log(`[Chatbot Logic] Pre-triggering Booking for ${bookingName} (${bookingCedula})`);
                                const booking = await bookAppointment({
                                    name: bookingName,
                                    phone: cleanPhone,
                                    cedula: bookingCedula,
                                    date: metadata.date || dateStr,
                                    time: metadata.time || "09:00",
                                    duration: metadata.duration || 20
                                });

                                console.log(`[Chatbot Logic] Pre-trigger Result:`, booking.success ? `SUCCESS (ID: ${booking.id})` : `FAILED (${booking.error})`);
                                toolExecutionResult = booking.success
                                    ? `[SISTEMA: CITA GRABADA EN CALENDARIO CORRECTAMENTE. ID: ${booking.id}. Avisar al usuario.]`
                                    : `[SISTEMA: ERROR AL GRABAR EN CALENDARIO: ${booking.error}.]`;

                                bookingExecuted = true;
                            }
                        }
                    } catch (e) { console.error('[Chatbot Logic] Pre-Meta Error:', e.message); }
                }
            }
        }

        // Generate a literal reference calendar for the next 24 days
        const getReferenceCalendar = () => {
            const lines = [];
            let d = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            const formatter = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' });
            lines.push(`CALENDARIO DE REFERENCIA (Próximas 3 semanas):`);
            for (let i = 0; i < 24; i++) {
                const dStr = d.toISOString().split('T')[0];
                const dayDate = new Date(`${dStr}T12:00:00-05:00`);
                const dName = formatter.format(dayDate);
                lines.push(`${dName} ${dStr}`);
                d.setDate(d.getDate() + 1);
            }
            lines.push(`\nREGLA: Puedes agendar CUALQUIER fecha de 2026 o 2027. Si el usuario pide una fecha fuera de esta lista, simplemente calcúlala y confírmala.`);
            return lines.join('\n');
        };

        // --- 6. SYSTEM PROMPT ---
        const mandatoryMetadataRule = `
        REGLA DE CONEXIÓN (MANDATORIA):
        - Para que la cita se guarde, DEBES anexar el bloque [METADATA: ...] al final de tu mensaje de confirmación.
        - Ejemplo: [METADATA: {"action": "create_appointment", "name": "...", "cedula": "...", "date": "YYYY-MM-DD", "time": "HH:MM"}]
        - SIN ESTE BLOQUE, LA CITA SE PIERDE. CONFIRMA Y AGENDA EN UN SOLO PASO SI YA TIENES LOS DATOS.
        `;

        const systemPrompt = `
        PUNTO DE CONTROL: ${mandatoryMetadataRule}

        ${personalityGuide}
        
        ${knowledgeBase}
        
        CONTEXTO TEMPORAL CRÍTICO:
        - Ciudad: Loja, Ecuador (Zona Horaria UTC-5)
        - Fecha de hoy: ${dateStr} (${dayEcu})
        - Hora actual de Loja: ${timeStr}
        - CALENDARIO DE REFERENCIA:
        ${getReferenceCalendar()}
        
        - DISPONIBILIDAD REAL PARA HOY/MAÑANA:
        ${availabilityContext}
        
        REGLAS DE MEMORIA Y RE-USO DE DATOS:
        1. REVISA SIEMPRE el campo "Paciente Registrado" arriba.
        2. Si ya tienes Nombre y Cédula en "Paciente Registrado", ¡NO LOS PIDAS DE NUEVO!
        3. En su lugar, pide una confirmación cortés: "Veo que tus datos registrados son [Nombre] con cédula [Cédula], ¿agendamos con estos datos o prefieres usar otros?".
        4. NUNCA asumas sin confirmar, pero NUNCA pidas que escriban algo que ya está en el registro.
        
        INSTRUCCIONES DE AGENDAMIENTO:
        1. Confirma si es ADULTO/NIÑO y el motivo (General/Frenillos).
        2. Al presentar horarios, AGRÚPALOS por "Mañana" y "Tarde" usando emojis y un formato elegante y profesional.
        3. Si hay muchos horarios, menciona solo los más relevantes o pregunta por un rango de preferencia.
        4. Al tener todo (y confirmar los datos del paciente), AGENDA Y CONFIRMA usando el bloque [METADATA: ...] al final.
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
        if (!metadata && (botResponse.toLowerCase().includes('agendado') || botResponse.toLowerCase().includes('confirmado'))) {
            console.log(`[Chatbot Logic] FAIL-SAFE: Reconstructing metadata from session for ${cleanPhone}`);
            const session = await getSession(cleanPhone);
            if (session && session.target_date && session.target_time) {
                metadata = {
                    action: "create_appointment",
                    name: session.name || "Paciente",
                    cedula: session.cedula || "0",
                    date: session.target_date,
                    time: session.target_time,
                    duration: session.duration || 20
                };
            }
        }

        if (!bookingExecuted && metadata && metadata.action === 'create_appointment') {
            const booking = await bookAppointment({
                name: metadata.name,
                phone: cleanPhone,
                cedula: metadata.cedula,
                date: metadata.date,
                time: metadata.time,
                duration: metadata.duration || 20
            });

            console.log(`[Chatbot Logic] Booking Attempt:`, booking.success ? `SUCCESS (${booking.id})` : `FAILED (${booking.error})`);
            toolExecutionResult = booking.success ? `SUCCESS (ID: ${booking.id})` : `FAILED: ${booking.error}`;

            if (booking.success) {
                // Persistent booking data to session
                await saveSession(cleanPhone, { name: metadata.name, cedula: metadata.cedula });
            } else {
                finalResponseText += `\n\n⚠️ (Error al registrar: ${booking.error})`;
            }
            bookingExecuted = true;
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
