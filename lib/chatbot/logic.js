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
        let session = await getSession(cleanPhone);
        if (!session) {
            session = { name: null, cedula: null, age: null, target_date: null, target_time: null, duration: 20, current_flow: 'Nuevo', metadata: null };
        }

        let patientContext = session ? `- Paciente: ${session.name || 'No identificado'} (Cédula: ${session.cedula || 'Pendiente'}, Edad: ${session.age || 'Pendiente'})` : "- Paciente: No identificado aún";
        if (session && session.target_date) {
            patientContext += `\n- Fecha seleccionada: ${session.target_date} a las ${session.target_time || 'pendiente'} (${session.duration || 20} min)`;
        }
        if (session && session.current_flow) {
            patientContext += `\n- Estado actual: ${session.current_flow}`;
        }

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
        const [allBlockedRows] = await db.execute('SELECT blocked_date, reason FROM blocked_dates WHERE blocked_date >= ?', [dateStr]);
        const blockedDatesText = allBlockedRows.length > 0
            ? allBlockedRows.map(b => `- ${b.blocked_date.toISOString().split('T')[0]}: ${b.reason || 'Cerrado'}`).join('\n')
            : "No hay fechas bloqueadas próximas.";

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
            const isConfirmationMsg = lowerMsg.includes('sí') || lowerMsg.includes('si') || lowerMsg.includes('acepto') || lowerMsg.includes('perfecto') || lowerMsg.includes('está bien');

            // Detect duration based on treatment synonyms (Sum up if multiple mentioned)
            const isOrthoTreatment = lowerMsg.includes('control') || lowerMsg.includes('ajuste') || lowerMsg.includes('ligas');
            const isOrthoEval = lowerMsg.includes('bracket') || lowerMsg.includes('frenillo') || lowerMsg.includes('ortodoncia') || lowerMsg.includes('valoración') || lowerMsg.includes('valoracion');
            const isPediatric = lowerMsg.includes('niño') || lowerMsg.includes('niña') || lowerMsg.includes('hijo') || lowerMsg.includes('hija') || lowerMsg.includes('bebé') || lowerMsg.includes('bebe') || lowerMsg.includes('pequeñ');
            const isGeneral = lowerMsg.includes('cero caries') || lowerMsg.includes('caries') || lowerMsg.includes('limpieza') || lowerMsg.includes('calza') || lowerMsg.includes('evaluación') || lowerMsg.includes('evaluacion') || lowerMsg.includes('chequeo') || lowerMsg.includes('consulta general');

            let duration = 20; // Default Standard: 20 min
            const hasMotive = isOrthoTreatment || isOrthoEval || isPediatric || isGeneral || lowerMsg.includes('cita para') || lowerMsg.includes('consulta de');

            if (isPediatric) duration = 60;
            else if (isOrthoTreatment) duration = 45;
            else if (isOrthoEval || isGeneral) duration = 20;

            console.log(`[Chatbot Logic] detected Motive: ${hasMotive}, Duration: ${duration}`);

            let slots = [];
            if (hasMotive || (session && session.current_flow.includes('Motivo recibido'))) {
                try {
                    slots = await getAvailableSlots(targetDate, duration, cleanPhone);
                    if (hasMotive) session.current_flow = "Motivo recibido";
                } catch (e) {
                    console.error(`[Chatbot Logic] Error getting slots: ${e.message}`);
                    toolExecutionResult = `[SISTEMA: Error obteniendo disponibilidad: ${e.message}]`;
                }
            } else {
                availabilityContext = `[SISTEMA: NO MOSTRAR HORARIOS TODAVÍA. Primero DEBES preguntar el MOTIVO de la consulta (ej: Limpieza, Frenillos, Dolor) para poder calcular el tiempo necesario y ver si hay espacio.]`;
            }

            const dayNameEcu = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(new Date(`${targetDate}T12:00:00-05:00`));

            // Check if day is blocked
            const [isBlocked] = await db.execute('SELECT reason FROM blocked_dates WHERE blocked_date = ?', [targetDate]);

            if (isBlocked.length > 0 || slots.length === 0) {
                const reason = isBlocked.length > 0 ? (isBlocked[0].reason || "Día no laborable") : "Sin turnos disponibles";

                // LOOKAHEAD: Find next 2 available days
                let lookaheadStr = "";
                let searchDate = new Date(`${targetDate}T12:00:00-05:00`);
                let found = 0;
                for (let i = 1; i <= 7 && found < 2; i++) {
                    searchDate.setDate(searchDate.getDate() + 1);
                    const dStr = searchDate.toISOString().split('T')[0];
                    const s = await getAvailableSlots(dStr, duration, cleanPhone);
                    if (s.length > 0) {
                        const dName = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(searchDate);
                        lookaheadStr += `\n- ${dName.toUpperCase()} ${dStr}: ${s.length} turnos (ej: ${s[0]}, ${s[Math.floor(s.length / 2)]})`;
                        found++;
                    }
                }

                if (isBlocked.length > 0) {
                    availabilityContext = `[BLOQUEO ABSOLUTO: LA CLÍNICA ESTÁ CERRADA EL ${dayNameEcu.toUpperCase()} ${targetDate}. Motivo: ${reason}. NO PUEDES AGENDAR NADA PARA ESTE DÍA.\nPRÓXIMOS DÍAS DISPONIBLES:${lookaheadStr}\nComunícalo al paciente con mucha amabilidad y ofrece estas alternativas.]`;
                } else {
                    availabilityContext = `[SIN DISPONIBILIDAD PARA EL ${dayNameEcu.toUpperCase()} ${targetDate} (${duration}min).\nPRÓXIMOS DÍAS DISPONIBLES:${lookaheadStr}\nSugiere estas alternativas.]`;
                }
            } else if (slots.length > 0) {
                const morningSlots = slots.filter(s => parseInt(s.split(':')[0]) < 13);
                const afternoonSlots = slots.filter(s => parseInt(s.split(':')[0]) >= 15);

                const listFormat = `☀️ MAÑANA: ${morningSlots.length > 0 ? morningSlots.join(' | ') : 'Sin turnos'}\n🌙 TARDE: ${afternoonSlots.length > 0 ? afternoonSlots.join(' | ') : 'Sin turnos'}`;

                availabilityContext = `LISTA DE HORARIOS DISPONIBLES PARA EL ${dayNameEcu.toUpperCase()} ${targetDate} (Duración: ${duration}min):\n${listFormat}\n\n⚠️ REGLA: Presenta los horarios en bloques horizontales como se muestra arriba. Pide confirmación de uno.`;
            } else if (hasMotive && !toolExecutionResult) {
                const dayOfWeek = new Date(`${targetDate}T12:00:00-05:00`).getDay();
                if (dayOfWeek === 0) {
                    availabilityContext = `[SISTEMA: CERRADO POR SER DOMINGO. Di cortésmente que los domingos no atendemos y ofrece sábado o lunes.]`;
                } else {
                    availabilityContext = `[SISTEMA: No hay turnos disponibles para esa duración (${duration} min) el ${targetDate} (${dayNameEcu}). Sugiere otro día.]`;
                }
            }

            // Persistence update: if we found a date/duration, keep it in memory
            if (targetDate && targetDate !== '9999-99-99') {
                session.target_date = targetDate;
                session.duration = duration;
            }

            // Detect if user chose a time (e.g., "a las 15:00")
            const timeMatch = lowerMsg.match(/(\d{1,2})[:h\s](\d{2})/);
            if (timeMatch) {
                const hh = timeMatch[1].padStart(2, '0');
                const mm = timeMatch[2];
                session.target_time = `${hh}:${mm}`;
            }



        }

        // --- 5. RESERVED FOR FUTURE LOGIC ---
        // (Eager booking logic removed to ensure mandatory Name, ID, Age collection)


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
        - Para que la cita se guarde, ES OBLIGATORIO recoger: Nombre, Cédula (10 dígitos) y Edad.
        - Ubicación: Lourdes entre Simón Bolívar y Bernardo Valdivieso (Loja). Tel: 096 341 0409.
        - Debes anexar el bloque [METADATA: ...] al final de tu mensaje de confirmación.
        - Ejemplo: [METADATA: {"action": "create_appointment", "name": "...", "cedula": "...", "age": "...", "date": "YYYY-MM-DD", "time": "HH:MM"}]
        - SIN ESTE BLOQUE O SIN ESTOS DATOS, LA CITA NO SE CREARÁ.
        `;

        const systemPrompt = `
        PUNTO DE CONTROL: ${mandatoryMetadataRule}

        INSTRUCCIONES DE VALIDACIÓN CRÍTICAS:
        1. **Cédula**: DEBE tener exactamente 10 dígitos. NO INTENTES CONTAR LOS DÍGITOS TÚ MISMO, simplemente envíalo en el METADATA si el usuario lo proporciona. El sistema validará la longitud técnicamente.
        2. **Edad vs Categoría**: Si el usuario dice que es "Adulto" pero tiene menos de 12 años, o si es "Niño" y tiene más de 12, menciona la inconsistencia y pregunta si la cita es para él o para alguien más.
        3. **Bloqueos**: Si una fecha aparece en el listado "FECHAS BLOQUEADAS", es PROHIBIDO agendar. No ignores esto.
        4. **Personalización**: Si el sistema te da el nombre del paciente en "Paciente Registrado", SALÚDALO POR SU NOMBRE (ej: "Hola Cristhopher") y no vuelvas a pedir el nombre ni la cédula a menos que el usuario indique que quiere usar otros datos.

         ${personalityGuide}
        
        FECHAS BLOQUEADAS (PROHIBIDAS):
        ${blockedDatesText}
        
        ${knowledgeBase}
        
        FLUJO DE PREGUNTAS (ORDEN):
        1. **Motivo de consulta**: Antes de mostrar disponibilidad, DEBES saber para qué es la cita (Limpieza, Frenillos, etc).
        2. **Paciente**: Confirmar si es ADULTO o NIÑO.
        3. **Recolección de datos**: Nombre, Cédula y Edad.
        4. **Fecha y Hora**: Mostrar horarios disponibles (agrupados) y permitir que el usuario elija.
        
        Pide los datos de uno en uno para no abrumar al usuario.

        
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
        2. Si ya tienes Nombre y Cédula en "Paciente Registrado", ¡NO LOS PIDAS DE NUEVO! Solo pide la EDAD si falta.
        3. En su lugar, pide una confirmación cortés: "Veo que tus datos registrados son [Nombre] con cédula [Cédula], ¿agendamos con estos datos o prefieres usar otros?".
        4. NUNCA asumas sin confirmar, pero NUNCA pidas que escriban algo que ya está en el registro.
        
        INSTRUCCIONES DE AGENDAMIENTO:
        1. **FLUJO OBLIGATORIO (ESTRICTO)**: Motivo -> Adulto/Niño -> Datos (Nombre, Cédula, Edad) -> Horarios -> Confirmación.
        2. **MOTIVO PRIMERO**: NUNCA muestres horarios ni sugieras fechas si aún no sabes el MOTIVO de la consulta. Si el usuario pide agendar sin decir para qué, pregúntale primero el motivo.
        3. **REGLA DE LAS 24 HORAS**: Por política de la clínica, solo se pueden agendar citas con al menos 24 HORAS DE ANTICIPACIÓN. El sistema filtrará automáticamente cualquier horario que no cumpla esto. Si el usuario pide algo para "ya" o para hoy mismo, explícale cortésmente esta regla.
        4. **DURACIÓN**: La duración depende del motivo (Limpieza/Calza/Consulta General: 20m, Frenillos Control: 45m, Frenillos Valoración: 20m, Niños: 60m). MENCIONA la duración estimada.
        5. **PRESENTACIÓN**: No muestres horarios hasta que sepas el "Motivo" y si es "Adulto/Niño".
        6. **REGLA DE ORO DE HORARIOS**: Si el sistema te proporciona una lista de horarios, TODOS son válidos. NUNCA digas que no se puede a una hora (ej: 17:30) si esa hora aparece en la lista. NO inventes reglas de "cerramos pronto" si el slot está disponible.
        7. **DOMINGOS Y HORAS**: Estamos CERRADOS los domingos. Sábados solo hasta las 15:00. NUNCA ofrezcas horarios fuera de los proporcionados por el sistema.
        8. **FORMATO DE LISTA**: Presenta los horarios en bloques horizontales usando el separador "|" (ej: 09:00 | 09:30 | 10:00). NO hagas listas largas hacia abajo.
        6. **FORMATO DE FECHA**: En el mensaje final de confirmación, NUNCA digas "Mañana" o "Pasado Mañana". Di SIEMPRE la fecha exacta (ej: "11 de febrero").
        7. **METADATA**: El campo "time" de METADATA debe estar SIEMPRE en formato 24h (HH:MM), ej: "15:30", NUNCA "3:30 PM".
        8. Al tener todo, AGENDA Y CONFIRMA usando el bloque [METADATA: ...] al final.


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
            } else if (mCedula.replace(/\D/g, '').length !== 10) {
                const actualLength = mCedula.replace(/\D/g, '').length;
                validationError = `La cédula debe tener exactamente 10 dígitos (tú proporcionaste ${actualLength}).`;
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
                    await saveSession(cleanPhone, { name: mName, cedula: mCedula, age: mAge, current_flow: "Agendamiento completado", metadata: null });
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
                name: metadata?.name || session?.name,
                cedula: metadata?.cedula || session?.cedula,
                age: metadata?.age || session?.age,
                target_date: session?.target_date,
                target_time: metadata?.time || session?.target_time,
                duration: session?.duration,
                current_flow: session?.current_flow || "En conversación",
                metadata: metadata
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
