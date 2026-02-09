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

            // Handle "14 de febrero"
            const numericMatch = text.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);

            if (numericMatch) {
                const dayNum = parseInt(numericMatch[1]);
                const monthName = numericMatch[2].toLowerCase();
                const months = {
                    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
                    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
                };
                date.setMonth(months[monthName]);
                date.setDate(dayNum);
            } else if (lowText.includes('hoy')) {
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
        if (lowerMsg.includes('cita') || lowerMsg.includes('disponibilidad') || lowerMsg.includes('cuándo') || lowerMsg.includes('horario') || lowerMsg.includes('cuanto') || lowerMsg.includes('hay') || lowerMsg.includes('se puede') || lowerMsg.includes('tienes espacio') || lowerMsg.includes('puedo ir')) {
            const targetDate = resolveDate(messageText);

            // Detect duration based on treatment synonyms
            let duration = 20; // Default (Consulta, limpieza, etc.)

            const isOrtho = lowerMsg.includes('ortodoncia') || lowerMsg.includes('frenillo') || lowerMsg.includes('bracket') || lowerMsg.includes('alambre') || lowerMsg.includes('ligas');
            const isPediatric = lowerMsg.includes('niño') || lowerMsg.includes('niña') || lowerMsg.includes('hijo') || lowerMsg.includes('hija') || lowerMsg.includes('bebé') || lowerMsg.includes('bebe') || lowerMsg.includes('pequeñ');

            if (isOrtho) duration = 45;
            else if (isPediatric) duration = 60;

            const slots = await getAvailableSlots(targetDate, duration);

            // Explicit guard for the AI
            const isSaturday = new Date(`${targetDate}T00:00:00-05:00`).getDay() === 6;
            const requestedTimeMatch = messageText.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|am|p\.m|a\.m)?/i);
            let timeWarning = "";

            if (targetDate === "9999-99-99") {
                timeWarning = "\n⚠️ ERROR: Fecha inexistente (ej: 30 de febrero). RECHAZA AMABLEMENTE.";
            } else if (requestedTimeMatch && isSaturday) {
                let hour = parseInt(requestedTimeMatch[1]);
                const pm = requestedTimeMatch[3]?.toLowerCase().includes('p');
                if (pm && hour < 12) hour += 12;
                if (hour >= 15 || (hour === 8 && parseInt(requestedTimeMatch[2] || "0") < 30)) {
                    timeWarning = "\n⚠️ ERROR: Fuera de horario de sábado (08:30-15:00).";
                }
            } else if (requestedTimeMatch) {
                let hour = parseInt(requestedTimeMatch[1]);
                const pm = requestedTimeMatch[3]?.toLowerCase().includes('p');
                if (pm && hour < 12) hour += 12;
                if (hour >= 18 || hour < 9 || (hour >= 13 && hour < 15)) {
                    timeWarning = "\n⚠️ ERROR: Fuera de horario L-V (9:00-13:00, 15:00-18:00).";
                }
            }

            availabilityContext = `LISTA DE HORARIOS DISPONIBLES PARA EL ${targetDate} (${messageText}) - Duración estimada: ${duration} min: ${slots.length > 0 ? slots.join(', ') : 'No hay turnos disponibles para este día.'}
            REGLA ESTRICTA: SOLO puedes ofrecer o confirmar horarios que estén en la LISTA de arriba. Si el usuario pide un horario que NO está en la lista, di que NO está disponible (cerrado o lleno).${timeWarning}`;

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
                            const bookingName = metadata.name || messageText.split('\n')[0].trim() || "Paciente Web";
                            const bookingCedula = metadata.cedula || (messageText.match(/\d{5,10}/) ? messageText.match(/\d{5,10}/)[0] : "0");

                            if (bookingName !== "Paciente Web" && bookingCedula !== "0") {
                                console.log(`[Chatbot Logic] Pre-triggering Booking:`, { bookingName, bookingCedula });
                                const booking = await bookAppointment({
                                    name: bookingName,
                                    phone: cleanPhone,
                                    cedula: bookingCedula,
                                    date: metadata.date || dateStr,
                                    time: metadata.time || "09:00",
                                    duration: metadata.duration || 20
                                });

                                toolExecutionResult = booking.success
                                    ? `[SISTEMA: CITA GRABADA EN CALENDARIO CORRECTAMENTE. Avisar al usuario.]`
                                    : `[SISTEMA: ERROR AL GRABAR EN CALENDARIO: ${booking.error}.]`;
                            }
                        }
                    } catch (e) { console.error('[Chatbot Logic] Pre-Meta Error:', e.message); }
                }
            }
        }

        // Generate a literal reference calendar for the next 14 days
        const getReferenceCalendar = () => {
            const lines = [];
            let d = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            for (let i = 0; i < 14; i++) {
                const dStr = d.toISOString().split('T')[0];
                const dName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()];
                lines.push(`${dName} ${dStr}`);
                d.setDate(d.getDate() + 1);
            }
            return lines.join('\n');
        };

        // --- 6. SYSTEM PROMPT ---
        const systemPrompt = `
        ${personalityGuide}
        
        ${knowledgeBase}
        
        CONTEXTO TEMPORAL CRÍTICO:
        - Ciudad: Loja, Ecuador (Zona Horaria UTC-5)
        - Fecha de hoy: ${dateStr} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][ecuadorTime.getDay()]})
        - Hora actual: ${timeStr}
        - CALENDARIO DE REFERENCIA (Próximas 2 semanas):
${getReferenceCalendar()}

        - HORARIOS DE ATENCIÓN Y DURACIONES:
            * Lunes a Viernes: 09:00 - 13:00 y 15:00 - 18:00 (Cerrado 13:00-15:00)
            * Sábados: 08:30 - 15:00 (Atención continua)
            * Domingos: CERRADO
            * DURACIONES POR TRATAMIENTO:
                - Ortodoncia: 45 minutos.
                - Emergencia Niños: 1 hora (60 min).
                - Consulta General / Valoración / Otros: 20 minutos (Default).
        
        INSTRUCCIÓN DE AGENDAMIENTO: 
        1. Para dar disponibilidad exacta, averigua si la cita es para un ADULTO o un NIÑO, y si es para CONTROL DE BRACKETS/FRENILLOS o una CONSULTA GENERAL (calzas, limpieza, dolor).
        2. Úsa lenguaje sencillo. En lugar de "Ortodoncia" pregunta "¿Es para control de frenillos/brackets?". En lugar de "Odontopediatría" pregunta "¿La cita es para un niño o un adulto?".
        3. Una vez que tengas una idea clara de qué necesitan, usa la disponibilidad mostrada en availabilityContext.
        
        - Cliente ID (Teléfono): ${cleanPhone}
        - ${patientContext}
        - ${availabilityContext}
        - ${toolExecutionResult}
        
        REGLAS DE MEMORIA Y DATOS:
        1. REVISA SIEMPRE el campo "Paciente Registrado" arriba. Si ya tiene Nombre y Cédula, NUNCA los vuelvas a pedir. Úsalos directamente.
        2. Si el usuario desea reagendar, asume que es la misma persona. No pidas datos si ya están en el historial o en la sesión activa.
        3. Si el paciente ya está registrado (${patientContext}), usa esos datos para la metadata.
        
        REGLAS DE VALIDACIÓN (HARDENING):
        1. FECHAS: Rechaza fechas imposibles (32 de febrero), fechas pasadas (ayer, 1999) o fechas ridículamente lejanas (año 2100).
        2. HORARIOS: Solo acepta horas válidas (00:00 a 23:59). Rechaza horas fuera de atención como 3am o 11pm.
        3. SIEMPRE usa el availabilityContext para confirmar si un hueco está libre.
        
        REGLAS CRÍTICAS:
        1. NO digas "Un momento", "Permítame verificar" o frases de espera.
        2. EMPATÍA PRIMERO: Si el usuario menciona dolor o molestia, responde con empatía antes de pedir datos o sugerir horas.
        3. UNA PREGUNTA A LA VEZ: No mezcles preguntas (ej: no pidas día y si es adulto/niño a la vez).
        4. FLUJO DE DATOS: Primero acuerda el día y la hora. SOLO DESPUÉS de tener el horario fijo, pide el Nombre y la Cédula.
        5. DISPONIBILIDAD Y FORMATO DE HORA:
           - Si el usuario dice "3pm", entiende que es lo mismo que "15:00".
           - NUNCA digas "No tenemos a las 3:00 pm pero sí a las 15:00". Usa el sentido común.
           - SOLO confirma horas que estén en la lista de disponibilidad (availabilityContext), pero acepta cualquier formato (am/pm o 24h).
           - Sábados solo hasta 15:00.
        6. Si ya tienes todo confirmado y el sistema devolvió éxito en toolExecutionResult, avisa que la cita ya está grabada.
        7. Deriva a humano en urgencias, quejas o confusión repetitiva.
        8. METADATA ESTRUCTURADA (OBLIGATORIO):
           Al confirmar detalles o agendar, incluye siempre al final:
           [METADATA: {"action": "confirm_details"|"create_appointment", "name": "...", "cedula": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "duration": 20|45|60}]
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
        let finalResponseText = botResponse.replace(/\[METADATA:.*?\]/g, '').trim();

        // --- 9. POST-COMPLETION TRIGGER (CRITICAL FIX) ---
        // If the AI response contains a booking request but we didn't trigger it yet
        if (botResponse.includes('"action": "create_appointment"') && !toolExecutionResult.includes('CITA GRABADA')) {
            const metaMatch = botResponse.match(/\[METADATA: (.*?)\]/);
            if (metaMatch) {
                try {
                    const metadata = JSON.parse(metaMatch[1]);
                    console.log(`[Chatbot Logic] Post-triggering Booking from AI Response:`, metadata);

                    const booking = await bookAppointment({
                        name: metadata.name || "Paciente",
                        phone: cleanPhone,
                        cedula: metadata.cedula || "0",
                        date: metadata.date || dateStr,
                        time: metadata.time || "09:00",
                        duration: metadata.duration || 20
                    });

                    if (!booking.success) {
                        finalResponseText += `\n\n⚠️ (Nota del sistema: Hubo un inconveniente al registrar la cita automáticamente: ${booking.error}. Te pediremos confirmar de nuevo.)`;
                    } else {
                        console.log(`[Chatbot Logic] Post-trigger success.`);
                        // Successfully booked!
                    }
                } catch (e) {
                    console.error('[Chatbot Logic] Post-Meta Error:', e.message);
                }
            }
        }

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
