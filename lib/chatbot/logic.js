import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import db from '../db.js';
import { checkAvailability, getAvailableSlots, bookAppointment, lockSlot, cancelAppointment } from './scripts/calendar_helper.js';
import { sendWhatsAppMessage as sendEvolutionWhatsApp } from '../whatsapp/evolution.js';
import { getSession, saveSession, ensureSessionTable } from './sessions.js';
import { transcribeAudio } from './transcription.js';
import { validateCedula } from './utils/validation.js';
import { resolveDate, getDateTruth } from './utils/date_helper.js';
import { getChatCompletion } from './utils/llm_provider.js';

// Initialize OpenAI (Keep for other potential uses, but main LLM now uses provider)
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

        // SELF-HEALING: Check if expires_at column exists
        try {
            const [columns] = await db.execute("SHOW COLUMNS FROM handoff_sessions LIKE 'expires_at'");
            if (columns.length === 0) {
                console.log("[Chatbot Logic] Adding missing column 'expires_at' to handoff_sessions");
                await db.execute("ALTER TABLE handoff_sessions ADD COLUMN expires_at TIMESTAMP NULL AFTER phone");
            }
        } catch (colErr) {
            console.warn("[Chatbot Logic] Could not verify/add expires_at column:", colErr.message);
        }
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
            CREATE TABLE IF NOT EXISTS ignored_numbers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // SELF-HEALING: Add name column if it doesn't exist
        try {
            const [cols] = await db.execute("SHOW COLUMNS FROM ignored_numbers LIKE 'name'");
            if (cols.length === 0) {
                await db.execute("ALTER TABLE ignored_numbers ADD COLUMN name VARCHAR(100) AFTER phone");
            }
        } catch (e) { console.warn("[DB] Could not verify/add name to ignored_numbers:", e.message); }

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
    // NORMALIZATION: Handle multi-device suffixes and clean digits correctly
    const cleanPhone = String(phoneNumber).split(':')[0].split('@')[0].replace(/\D/g, '');

    try {
        await ensureTables();

        // 1. Check if number is specifically IGNORED (Blacklist)
        // Flexible match: handle 5939... vs 09... formats
        let altPhone = cleanPhone.startsWith('593') ? '0' + cleanPhone.substring(3) : 
                       (cleanPhone.startsWith('0') ? '593' + cleanPhone.substring(1) : cleanPhone);

        const [ignored] = await db.execute(
            'SELECT 1 FROM ignored_numbers WHERE phone = ? OR phone = ?', 
            [cleanPhone, altPhone]
        );
        
        if (ignored.length > 0) {
            console.log(`[Chatbot Logic] Number ${cleanPhone} (alt: ${altPhone}) is in IGNORED_NUMBERS. Skipping.`);
            return { success: true, ignored: true };
        }

        // 2. Check if bot is sleeping for this number (handoff active)
        const [handoff] = await db.execute('SELECT id FROM handoff_sessions WHERE phone = ? AND (expires_at > NOW() OR expires_at IS NULL)', [cleanPhone]);
        if (handoff.length > 0) {
            console.log(`[Chatbot Logic] Handoff ACTIVE for ${cleanPhone}. Bot is SLEEPING.`);
            return { success: true, sleeping: true };
        }

        // RATE LIMITING: Max 50 messages per hour per phone number
        try {
            const [rateRows] = await db.execute(
                'SELECT COUNT(*) as cnt FROM chatbot_logs WHERE phone = ? AND timestamp > NOW() - INTERVAL 1 HOUR',
                [cleanPhone]
            );
            if (rateRows[0]?.cnt >= 50) {
                console.log(`[Chatbot Logic] RATE LIMIT reached for ${cleanPhone} (${rateRows[0].cnt} msgs/hr). Ignoring.`);
                return;
            }
        } catch (rlErr) {
            console.warn('[Chatbot Logic] Rate limit check failed:', rlErr.message);
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

        // ensureTables and ignored checks moved to top
        await ensureSessionTable();

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
        
        // ============================================================
        // CONTEXT-AWARE: Handle confirmation responses when in awaiting_confirmation context
        // If session.current_flow === 'awaiting_confirmation', respond to the cron reminder
        const isAwaitingConfirmation = session.current_flow === 'awaiting_confirmation' && session.metadata?.awaiting_confirmation;
        
        if (isAwaitingConfirmation) {
            console.log(`[Logic] In awaiting_confirmation context. Processing response: "${messageText}"`);
            
            const confirmData = session.metadata.awaiting_confirmation;
            const apptId = confirmData.appointmentId;
            const apptDate = confirmData.date;
            const apptTime = confirmData.time;
            
            // Check if response is affirmative or negative
            const isAffirmative = /^(\s*si\s*|\s*sí\s*|\s*confirmo\s*|\s*ok\s*|\s*si,?\s*confirmo\s*|\s*asistire\s*|\s*asistiré\s*)$/i.test(lowerMsg) || 
                                  lowerMsg === 'si' || lowerMsg === 'sí' || lowerMsg === 'ok' || lowerMsg === 'confirmo' ||
                                  lowerMsg.includes('si') || lowerMsg.includes('confirm') || lowerMsg.includes('ok');
            const isNegative = /^(\s*no\s*|\s*cancelar\s*|\s*no\s*asistire\s*|\s*no\s*podre\s*)$/i.test(lowerMsg) || 
                               lowerMsg === 'no' || lowerMsg === 'cancelo' || lowerMsg.includes('cancel');
            
            try {
                if (isAffirmative) {
                    // CONFIRM the appointment using appointmentId from session context
                    console.log(`[Logic] CONFIRMING appointment ${apptId} (context-aware)`);
                    
                    const updateResult = await db.execute(
                        `UPDATE appointments SET status = 'confirmed' WHERE id = ?`,
                        [apptId]
                    );
                    
                    console.log(`[Logic] Confirmation update: affectedRows=${updateResult.affectedRows}`);
                    
                    // Clear the confirmation context
                    session.current_flow = null;
                    session.metadata = {};
                    await saveSession(cleanPhone, session);
                    
                    // Format date for response
                    const dateParts = apptDate.split('-');
                    const dateObj = new Date(dateParts[0], parseInt(dateParts[1]) - 1, dateParts[2]);
                    const dateFormatted = dateObj.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
                    
                    const responseMsg = `✅ *¡Cita confirmada!* 📅 ${dateFormatted} a las *${apptTime.substring(0, 5)}*\n\nTe esperamos en Hexadent. 👋`;
                    
                    await logActivity(cleanPhone, messageText, responseMsg, "CONFIRMATION_SUCCESS_CONTEXT");
                    await sendEvolutionWhatsApp(phoneNumber, responseMsg);
                    return { success: true, botResponse: responseMsg };
                    
                } else if (isNegative) {
                    // CANCEL the appointment using appointmentId from session context
                    console.log(`[Logic] CANCELLING appointment ${apptId} (context-aware)`);
                    
                    const updateResult = await db.execute(
                        `UPDATE appointments SET status = 'cancelled' WHERE id = ?`,
                        [apptId]
                    );
                    
                    console.log(`[Logic] Cancellation update: affectedRows=${updateResult.affectedRows}`);
                    
                    // Clear the confirmation context
                    session.current_flow = null;
                    session.metadata = {};
                    await saveSession(cleanPhone, session);
                    
                    const responseMsg = "✅ *Tu cita ha sido cancelada.*\n\nTu espacio ha sido liberado para otro paciente.\n\nSi deseas reagendar, con gusto te atenderemos.";
                    
                    await logActivity(cleanPhone, messageText, responseMsg, "CANCELLATION_SUCCESS_CONTEXT");
                    await sendEvolutionWhatsApp(phoneNumber, responseMsg);
                    return { success: true, botResponse: responseMsg };
                    
                } else {
                    // Response not clearly affirmative or negative - keep waiting for confirmation
                    console.log(`[Logic] Response unclear, still waiting for confirmation: "${messageText}"`);
                    // Don't change context, let it pass to LLM
                }
            } catch (ctxErr) {
                console.error(`[Logic] Context-aware confirmation error: ${ctxErr.message}`);
            }
        }
        
        // ============================================================
        // NEW: Handle CONFIRMATION responses (SI, CONFIRMO, etc.)
        // If user says "si", "sí", "confirmo", "ok", etc. AND has appointment, CONFIRM it!
        // Confirmation: si, sí, confirmo, ok, y variaciones largas
        const isSimpleConfirmation = /^(\s*si\s*|\s*sí\s*|\s*confirmo\s*|\s*ok\s*|\s*si,?\s*confirmo\s*|\s*confirmo\s*asistencia\s*|\s*si\s*confirmo\s*|\s*asistire\s*|\s*asistiré\s*|\s*si\s*asistire\s*)$/i.test(lowerMsg) || 
                                  lowerMsg === 'si' || lowerMsg === 'sí' || lowerMsg === 'ok' || lowerMsg === 'si confirmo' ||
                                  lowerMsg.includes('si') && lowerMsg.includes('confirm') && lowerMsg.length < 50; // "Si, confirmo la cita"
        
        if (isSimpleConfirmation) {
            console.log(`[Logic] User confirmed with: "${messageText}". Checking for existing appointment...`);
            
            try {
                // Generate all possible phone formats for matching
                const clean9 = cleanPhone.replace(/^593/, ''); // 9 digits: 967491847
                const clean8 = cleanPhone.replace(/^593|^0/, ''); // 8 digits: 967491847
                const withZero = '0' + clean8; // With 0 prefix: 0967491847
                const with593 = '593' + clean8; // With 593 prefix: 593967491847
                const withDoubleZero = '00' + clean8; // With 00 prefix: 00967491847
                
                console.log(`[Logic] DEBUG: clean8=${clean8}, clean9=${clean9}, withZero=${withZero}, with593=${with593}, withDoubleZero=${withDoubleZero}`);
                
                // Search WITHOUT status filter - find ANY upcoming appointment for this phone
                const searchTerms = ['%' + clean8 + '%', withZero, clean8, with593, withDoubleZero, '0' + clean8];
                console.log(`[Logic] DEBUG: searchTerms = ${JSON.stringify(searchTerms)}`);
                
                // Search for any upcoming appointment (no status filter, no date filter)
                const [appts] = await db.execute(
                    `SELECT id, appointment_date, appointment_time, patient_name, motive, status FROM appointments 
                     WHERE appointment_date >= CURDATE() - INTERVAL 1 DAY
                     AND (patient_phone LIKE ? OR patient_phone = ? OR patient_phone = ? OR patient_phone = ? OR patient_phone = ? OR patient_phone = ?)
                     ORDER BY appointment_date ASC, appointment_time ASC LIMIT 10`,
                    searchTerms
                );
                
                console.log(`[Logic] DEBUG: Found ${appts.length} appointments (any status)`);
                
                // Log all appointment statuses for debugging
                for (const appt of appts) {
                    console.log(`[Logic] DEBUG: appointment id=${appt.id}, status="${appt.status}", date=${appt.appointment_date}, time=${appt.appointment_time}`);
                }
                
                // Filter to appointments that can be confirmed (scheduled, empty/null, or undefined)
                const scheduledAppts = appts.filter(a => 
                    a.status === 'scheduled' || 
                    !a.status || 
                    a.status === '' || 
                    a.status === null || 
                    a.status === undefined
                );
                
                // Sort by date to get the soonest appointment
                scheduledAppts.sort((a, b) => {
                    const dateA = new Date(a.appointment_date);
                    const dateB = new Date(b.appointment_date);
                    return dateA - dateB;
                });
                
                console.log(`[Logic] DEBUG: ${scheduledAppts.length} confirmable appointments, showing soonest: ${scheduledAppts[0]?.appointment_date}`);
                
                // Also check for confirmed appointments
                const confirmedAppts = appts.filter(a => a.status === 'confirmed');
                console.log(`[Logic] DEBUG: ${confirmedAppts.length} confirmed appointments`);
                
                if (scheduledAppts.length > 0) {
                    console.log(`[Logic] CONFIRMATION SUCCESS! Found ${scheduledAppts.length} appointment(s)`);
                    
                    // Update status to confirmed - use direct query
                    const apptId = scheduledAppts[0].id;
                    console.log(`[Logic] Updating appointment ${apptId} to confirmed...`);
                    
                    // Try with simple UPDATE
                    const updateResult = await db.execute(
                        `UPDATE appointments SET status = 'confirmed' WHERE id = ?`,
                        [apptId]
                    );
                    
                    console.log(`[Logic] Update result: affectedRows=${updateResult.affectedRows}, info=${updateResult.info}`);
                    
                    // Force verify with fresh connection
                    const connection = await db.getConnection();
                    try {
                        await connection.execute('COMMIT');
                    } catch(e) {}
                    finally {
                        connection.release();
                    }
                    
                    // Verify the update worked with fresh query
                    const [verify] = await db.execute(
                        'SELECT id, status FROM appointments WHERE id = ?',
                        [apptId]
                    );
                    console.log(`[Logic] Verification: appointment ${apptId} now has status="${verify[0].status}"`);
                    
                    // Only show the FIRST appointment being confirmed (the one from today/soonest)
                    const appt = scheduledAppts[0];
                    const formatDate = (d) => {
                        try {
                            // Handle both string and Date objects
                            let dateStr;
                            if (typeof d === 'string') {
                                dateStr = d.split('T')[0]; // "2026-06-22"
                            } else if (d instanceof Date) {
                                dateStr = d.toISOString().split('T')[0];
                            } else {
                                dateStr = String(d).split('T')[0];
                            }
                            const parts = dateStr.split('-');
                            const year = parseInt(parts[0]);
                            const month = parseInt(parts[1]) - 1;
                            const day = parseInt(parts[2]);
                            const dateObj = new Date(year, month, day);
                            return dateObj.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
                        } catch (e) {
                            return String(d).split('T')[0];
                        }
                    };
                    
                    let motive = (appt.motive || 'Consulta Dental').replace(/\[ESPECIAL\]/g, '').replace(/\[.*?\]/g, '').trim();
                    if (!motive || motive === '') motive = 'Consulta Dental';
                    
                    const responseMsg = `✅ *¡Su cita está confirmada!*\n\n📅 *${formatDate(appt.appointment_date)}* a las *${appt.appointment_time.substring(0, 5)}*\n   Motivo: ${motive}\n\n¡Lo esperamos! 🦷\nSi necesita reagendar, me avisa.`;
                    
                    await saveSession(cleanPhone, session);
                    await logActivity(cleanPhone, messageText, responseMsg, "CONFIRMATION_SUCCESS");
                    await sendEvolutionWhatsApp(phoneNumber, responseMsg);
                    return { success: true, botResponse: responseMsg };
                }
                
                // If already confirmed, let user know
                if (confirmedAppts.length > 0) {
                    console.log(`[Logic] Already confirmed! Notifying user.`);
                    
                    const formatDate = (d) => {
                        const dateStr = String(d).split('T')[0];
                        const dateObj = new Date(dateStr + 'T12:00:00-05:00');
                        return dateObj.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guayaquil' });
                    };
                    
                    let responseMsg = "ℹ️ *Su cita ya está confirmada.*\n\n";
                    for (const appt of confirmedAppts) {
                        let motive = (appt.motive || 'Consulta Dental').replace(/\[ESPECIAL\]/g, '').replace(/\[.*?\]/g, '').trim();
                        if (!motive || motive === '') motive = 'Consulta Dental';
                        
                        responseMsg += `📅 *${formatDate(appt.appointment_date)}* a las *${appt.appointment_time.substring(0, 5)}*\n`;
                        responseMsg += `   Motivo: ${motive}\n\n`;
                    }
                    responseMsg += "¡Lo esperamos! 🦷\nSi necesita reagendar, me avisa.";
                    
                    await saveSession(cleanPhone, session);
                    await logActivity(cleanPhone, messageText, responseMsg, "ALREADY_CONFIRMED");
                    await sendEvolutionWhatsApp(phoneNumber, responseMsg);
                    return { success: true, botResponse: responseMsg };
                }
            } catch (confirmErr) {
                console.error(`[Logic] Confirmation check error: ${confirmErr.message}`);
            }
        }
        
        let availabilityContext = "";
        let toolExecutionResult = "";
        // ============================================================
        // NEW: Handle CANCELLATION responses (NO, CANCELAR, etc.)
        const isCancellation = /^(\s*no\s*|\s*cancelar\s*|\s*no\s*asistire\s*|\s*no\s*asistiré\s*|\s*no\s*confirmo\s*|\s*no\s*podre\s*)$/i.test(lowerMsg) || 
                          lowerMsg === 'no' || lowerMsg === 'cancelo' ||
                          lowerMsg.includes('no') && lowerMsg.includes('cancel') && lowerMsg.length < 50; // "No, cancelo la cita"
        
        if (isCancellation) {
            console.log(`[Logic] User wants to CANCEL with: "${messageText}". Checking for existing appointment...`);
            
            try {
                // Generate all possible phone formats for matching (SAME AS CONFIRMATION)
                const clean9 = cleanPhone.replace(/^593/, ''); // 9 digits
                const clean8 = cleanPhone.replace(/^593|^0/, ''); // 8 digits
                const withZero = '0' + clean8;
                const with593 = '593' + clean8;
                const withDoubleZero = '00' + clean8;
                
                console.log(`[Logic] DEBUG CANCEL: clean8=${clean8}, clean9=${clean9}, withZero=${withZero}, with593=${with593}, withDoubleZero=${withDoubleZero}`);
                
                // Search any upcoming appointment (no status filter) - SAME AS CONFIRMATION
                const searchTerms = ['%' + clean8 + '%', withZero, clean8, with593, withDoubleZero, '0' + clean8];
                console.log(`[Logic] DEBUG CANCEL: searchTerms = ${JSON.stringify(searchTerms)}`);
                
                const [appts] = await db.execute(
                    `SELECT id, appointment_date, appointment_time, status FROM appointments 
                     WHERE appointment_date >= CURDATE() - INTERVAL 1 DAY
                     AND (patient_phone LIKE ? OR patient_phone = ? OR patient_phone = ? OR patient_phone = ? OR patient_phone = ? OR patient_phone = ?)
                     ORDER BY appointment_date ASC LIMIT 5`,
                    searchTerms
                );
                
                console.log(`[Logic] DEBUG CANCEL: Found ${appts.length} appointments`);
                
                // Filter to appointments that can be cancelled (scheduled or empty)
                const cancellableAppts = appts.filter(a => 
                    a.status === 'scheduled' || 
                    !a.status || 
                    a.status === '' || 
                    a.status === null || 
                    a.status === undefined
                );
                console.log(`[Logic] DEBUG CANCEL: ${cancellableAppts.length} cancellable appointments`);
                
                // Sort by date
                cancellableAppts.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
                
                if (cancellableAppts.length > 0) {
                    console.log(`[Logic] CANCELLATION: Found appointment to cancel, ID: ${cancellableAppts[0].id}`);
                    
                    const apptId = cancellableAppts[0].id;
                    
                    // Cancel by ID directly
                    const updateResult = await db.execute(
                        'UPDATE appointments SET status = "cancelled" WHERE id = ?',
                        [apptId]
                    );
                    
                    console.log(`[Logic] Cancellation update result: affectedRows=${updateResult.affectedRows}`);
                    
                    // Verify
                    const [verify] = await db.execute(
                        'SELECT status FROM appointments WHERE id = ?',
                        [apptId]
                    );
                    console.log(`[Logic] Verification: appointment ${apptId} now has status="${verify[0].status}"`);
                    
                    const responseMsg = "✅ *Su cita ha sido cancelada.*\n\nSu espacio ha sido liberado para otro paciente.\n\nSi desea reagendar, con gusto le atendemos.";
                    
                    await saveSession(cleanPhone, session);
                    await logActivity(cleanPhone, messageText, responseMsg, "CANCELLATION_SUCCESS");
                    await sendEvolutionWhatsApp(phoneNumber, responseMsg);
                    return { success: true, botResponse: responseMsg };
                }
            } catch (cancelErr) {
                console.error(`[Logic] Cancellation check error: ${cancelErr.message}`);
            }
        }
        
        let bookingExecuted = false;
        let slots = [];
        let targetDate = session.target_date || null;

        // ============================================================
        // NEW: Check for existing appointment query (BEFORE booking flow)
        // Detect patterns like "mi cita", "estado de mi cita", "confirmar mi cita", etc.
        const isCitasQuery = lowerMsg.includes('mi cita') || lowerMsg.includes('estado cita') || 
                          lowerMsg.includes('confirmar') || lowerMsg.includes('cuando') && lowerMsg.includes('cita') ||
                          lowerMsg.includes('revisar') && lowerMsg.includes('cita') ||
                          lowerMsg.includes('verificar') && lowerMsg.includes('cita') ||
                          (lowerMsg.includes('que') && lowerMsg.includes('fecha') && lowerMsg.includes('cita'));
        
        // Only check if NOT already in booking flow and user asks about their existing appointment
        const isNotBookingFlow = !session.target_date || session.current_flow === 'Agendamiento completado';
        
        if (isCitasQuery && isNotBookingFlow) {
            console.log(`[Logic] User asking about existing appointment. Checking by phone: ${cleanPhone}`);
            
            try {
                // 1. Try to find by phone number (exact match)
                const [apptsByPhone] = await db.execute(
                    'SELECT appointment_date, appointment_time, patient_name, motive, status FROM appointments WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE() ORDER BY appointment_date ASC, appointment_time ASC LIMIT 5',
                    [cleanPhone]
                );
                
                // 2. Also try alternate phone formats (593 vs 0 prefix)
                const altPhone = cleanPhone.startsWith('593') ? '0' + cleanPhone.substring(3) : 
                              (cleanPhone.startsWith('0') ? '593' + cleanPhone.substring(1) : cleanPhone);
                
                const [apptsByAltPhone] = await db.execute(
                    'SELECT appointment_date, appointment_time, patient_name, motive, status FROM appointments WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE() ORDER BY appointment_date ASC, appointment_time ASC LIMIT 5',
                    [altPhone]
                );
                
                // Combine results, avoiding duplicates
                const allAppts = [...apptsByPhone];
                const existingIds = new Set(allAppts.map(a => a.appointment_date + ' ' + a.appointment_time));
                for (const appt of apptsByAltPhone) {
                    const key = appt.appointment_date + ' ' + appt.appointment_time;
                    if (!existingIds.has(key)) allAppts.push(appt);
                }
                
                if (allAppts.length > 0) {
                    console.log(`[Logic] Found ${allAppts.length} existing appointment(s) for phone ${cleanPhone}`);
                    
                    // Format response with appointment details
                    const formatDate = (d) => {
                        const dateObj = new Date(d + 'T12:00:00-05:00');
                        return dateObj.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Guayaquil' });
                    };
                    
                    let responseMsg = "Revisé en el sistema y ✅ YA TIENE una cita agendada:\n\n";
                    for (const appt of allAppts) {
                        responseMsg += `📅 *${formatDate(appt.appointment_date)}* a las *${appt.appointment_time.substring(0, 5)}*\n`;
                        responseMsg += `   Motivo: ${appt.motive || 'Consulta General'}\n\n`;
                    }
                    responseMsg += "Si necesita reagendar o tiene alguna consulta, con gusto le atenderé.";
                    
                    await saveSession(cleanPhone, session);
                    await logActivity(cleanPhone, messageText, responseMsg, toolExecutionResult);
                    await sendEvolutionWhatsApp(phoneNumber, responseMsg);
                    return { success: true, botResponse: responseMsg };
                } else {
                    console.log(`[Logic] No existing appointments found for phone ${cleanPhone}`);
                    // Continue to normal flow - bot will ask for details if needed
                }
            } catch (lookupErr) {
                console.error(`[Logic] Appointment lookup error: ${lookupErr.message}`);
                // Continue to normal flow
            }
        }
        // ============================================================

        const resolvedDate = resolveDate(messageText, now);
        const isCurrentlyInBookingFlow = session && session.target_date && session.current_flow !== 'Agendamiento completado';
        const isExplicitBooking = lowerMsg.includes('cita') || lowerMsg.includes('agendar') || lowerMsg.includes('horario') || lowerMsg.includes('disponibilidad') || lowerMsg.includes('consulta') || lowerMsg.includes('revision');

        if (isExplicitBooking || isCurrentlyInBookingFlow || resolvedDate) {
            targetDate = resolvedDate || session.target_date || dateStr;
            if (targetDate instanceof Date) targetDate = targetDate.toISOString().split('T')[0];

            const duration = 45;
            const isOrtho = lowerMsg.includes('bracket') || lowerMsg.includes('frenillo') || lowerMsg.includes('ortodoncia');
            const isPediatric = lowerMsg.includes('niño') || lowerMsg.includes('hijo') || lowerMsg.includes('infantil');
            const isProsthesis = lowerMsg.includes('protesis') || lowerMsg.includes('placa') || lowerMsg.includes('diente postizo') || lowerMsg.includes('puente');
            const isSurgery = lowerMsg.includes('cirugia') || lowerMsg.includes('tercer molar') || lowerMsg.includes('muela del juicio') || lowerMsg.includes('extraccion');

            if (isProsthesis) {
                session.age = session.age || 40; // Default adult age for prosthesis
                console.log("[Logic] Prosthesis detected. Forcing adult context.");
            }

            const isCheckup = lowerMsg.includes('consulta') || lowerMsg.includes('revision') || lowerMsg.includes('valoracion') || lowerMsg.includes('chequeo') || lowerMsg.includes('evaluacion');
            const isPain = lowerMsg.includes('duele') || lowerMsg.includes('dolor') || lowerMsg.includes('urgencia') || lowerMsg.includes('molestia');
            const isCleaning = lowerMsg.includes('limpieza') || lowerMsg.includes('calza') || lowerMsg.includes('caries') || lowerMsg.includes('restauracion');

            // Detect specific time in message to allow availability check even without motive
            const timeInMsg = messageText.match(/(?:\d{1,2})(?::\d{2})?\s*(?:am|pm)?/i);
            const hasSpecificTime = !!timeInMsg;

            // Trigger availability check ALWAYS if targetDate is found (Motive is optional)
            if (targetDate) {
                try {
                    // PAST DATE GUARD
                    const nowEcuLogic = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
                    const todayStrLogic = `${nowEcuLogic.getFullYear()}-${(nowEcuLogic.getMonth() + 1).toString().padStart(2, '0')}-${nowEcuLogic.getDate().toString().padStart(2, '0')}`;

                    if (targetDate < todayStrLogic) {
                        availabilityContext = `[ESTADO CRÍTICO: FECHA EN EL PASADO. El ${targetDate} ya pasó (hoy es ${todayStrLogic}). DILE al usuario amablemente que NO podemos agendar en fechas pasadas y pídele una fecha futura.]`;
                        toolExecutionResult = availabilityContext;
                    } else {
                        // 6-MONTH WINDOW GUARD
                        const maxDateLogic = new Date(nowEcuLogic);
                        maxDateLogic.setMonth(maxDateLogic.getMonth() + 6);
                        const maxStrLogic = `${maxDateLogic.getFullYear()}-${(maxDateLogic.getMonth() + 1).toString().padStart(2, '0')}-${maxDateLogic.getDate().toString().padStart(2, '0')}`;

                        if (targetDate > maxStrLogic) {
                            availabilityContext = `[ESTADO: FECHA MUY LEJANA. El ${targetDate} supera nuestro límite de 6 meses. Pídele al usuario una fecha más cercana. IMPORTANTE: Dilo de forma natural como "disculpe, por el momento solo podemos agendar hasta el ${maxStrLogic}", NO digas "límite de agendamiento".]`;
                            toolExecutionResult = availabilityContext;
                        } else {
                            session.target_date = targetDate;
                            session.duration = duration;
                            session.current_flow = "Motivo recibido";

                            // CRITICAL: Check BLOCKED STATUS FIRST before any time validation
                            const [isBlockedRows] = await db.execute("SELECT reason FROM blocked_dates WHERE DATE_FORMAT(blocked_date, '%Y-%m-%d') = ?", [targetDate]);
                            
                            if (isBlockedRows.length > 0) {
                                // DAY IS MANUALLY BLOCKED - Skip ALL time validation, inform directly
                                availabilityContext = `[ESTADO: DÍA NO DISPONIBLE. El ${targetDate} no tiene disponibilidad. El usuario pregunta por este día específicamente. IMPORTANTE: Dile directamente que "No tenemos disponibilidad para ese día" o "Ese día no estamos atendiendo". NO menciones horarios, NO pidas datos, NO ofrezcas la hora específica que pidió. Solo indica que no hay disponibilidad y ofrece alternativas (días cercanos con horarios).]`;
                                slots = [];
                            } else {
                                // Day is NOT blocked - proceed with normal availability and time validation
                                slots = await getAvailableSlots(targetDate, duration, cleanPhone);
                                const dateTruth = getDateTruth(targetDate, now);

                                // CHECK IF USER ALREADY HAS AN APPOINTMENT THIS DAY
                                const [userAppts] = await db.execute('SELECT appointment_time FROM appointments WHERE patient_phone = ? AND appointment_date = ? AND status = "scheduled"', [cleanPhone, targetDate]);
                                if (userAppts.length > 0) {
                                    const apptTime = userAppts[0].appointment_time.toString().substring(0, 5);
                                    availabilityContext += `\n[USUARIO YA TIENE CITA: El paciente YA TIENE una cita para el ${targetDate} a las ${apptTime}. Si pregunta por su cita o intenta confirmar, DILE QUE SÍ, que su cita está confirmada para esa hora. NO le digas que no hay cupo a esa hora.]`;
                                }

                                if (dateTruth.includes('Cerrado')) {
                                    availabilityContext = `[ESTADO CRÍTICO: CERRADO para ${targetDate}. ${dateTruth}. NO HAREMOS CITAS. Dile al usuario que ese día estamos cerrados y ofrece otro día.]`;
                                } else if (slots.length === 0) {
                                    availabilityContext = `[ESTADO: SIN HORARIOS DISPONIBLES para ${targetDate}. El día está abierto pero todos los turnos están ocupados. Indica que no hay cupos y ofrece días alternativos cercanos.]`;
                                } else if (slots.length > 0) {
                                    let displaySlots = slots.filter(s => s !== "14:00" && s !== "16:00" && s !== "08:00");
                                    availabilityContext = `[INFO: HORARIOS DISPONIBLES para ${targetDate}: ${displaySlots.join(', ')}. ${dateTruth}]`;
                                }
                            }
                            toolExecutionResult = availabilityContext;
                        }
                    }
                } catch (e) { console.error("Slots Error:", e); }
            }
        }

        // Detect Time Selection (Improved for natural language)
        const timePatterns = /(?:a\s+las\s+)?(\d{1,2})(?:\s*[:h\s.\-y]\s*(\d{2}|media|cuarto))?(\s*[ap]m)?/gi;
        let m, bestMatch = null, proposedTime = null;
        while ((m = timePatterns.exec(lowerMsg)) !== null) {
            let hh = parseInt(m[1]);
            let mmRaw = m[2] ? m[2].toLowerCase() : "00";
            let mm = "00";

            if (mmRaw === "media") mm = "30";
            else if (mmRaw === "cuarto") mm = "15";
            else mm = mmRaw.padStart(2, '0');

            const ampm = m[3]?.toLowerCase().trim();
            if (ampm === 'pm' && hh < 12) hh += 12;
            else if (!ampm && hh > 0 && hh <= 7) hh += 12; // Assume afternoon if 1-7 without am/pm
            
            if (hh >= 24) continue; // Ignore numbers that are too large to be hours (like dates)

            const testTime = `${hh.toString().padStart(2, '0')}:${mm}`;
            if (slots.includes(testTime)) { bestMatch = testTime; break; }
            if (!proposedTime) proposedTime = testTime;
        }

        if (bestMatch || proposedTime) {
            const finalTime = bestMatch || proposedTime;
            const isTargetSaturday = targetDate && new Date(targetDate + 'T12:00:00-05:00').getDay() === 6;
            const targetDayOfWeek = targetDate ? new Date(targetDate + 'T12:00:00-05:00').getDay() : -1;
            
            // VALIDACIÓN DE HORARIO FUERA DE RANGO
            const [finalH, finalM] = finalTime.split(':').map(Number);
            let isWithinBusinessHours = false;
            
            if (isTargetSaturday) {
                // Sábados: 08:30 a 15:00 (sin cierre al mediodía) + Especial 16:00 y 08:00
                const timeInMinutes = finalH * 60 + finalM;
                isWithinBusinessHours = (timeInMinutes >= (8 * 60 + 30) && timeInMinutes < (15 * 60)) || finalTime === "16:00" || finalTime === "08:00";
            } else if (targetDayOfWeek >= 1 && targetDayOfWeek <= 5) {
                // Lunes a Viernes: 09:00 a 13:00 y 15:00 a 18:15 + Especial 14:00
                const timeInMinutes = finalH * 60 + finalM;
                isWithinBusinessHours = (timeInMinutes >= (9 * 60) && timeInMinutes < (13 * 60)) || 
                                        (timeInMinutes >= (15 * 60) && timeInMinutes < (18 * 60)) ||
                                        finalTime === "14:00";
            }
            
            // Si el horario está fuera del rango de atención, rechazar inmediatamente y BLOQUEAR FLUJO
            if (!isWithinBusinessHours && targetDate) {
                let hoursMessage = isTargetSaturday 
                    ? "los sábados atendemos de 08:30 a 15:00 (último turno 14:30)" 
                    : "de lunes a viernes atendemos de 09:00 a 13:00 y de 15:00 a 18:15 (último turno 18:15)";
                availabilityContext = `[ERROR CRÍTICO DE HORARIO: ${finalTime} está FUERA DEL HORARIO DE ATENCIÓN para ${targetDate}. ${hoursMessage}. ESTÁ PROHIBIDO agendar a esta hora. DEBES decirle al usuario amablemente que ese horario no está disponible y pedirle que elija otro dentro del horario permitido.]`;
                session.target_time = null;
                session.current_flow = "Horario inválido - esperando corrección";
                toolExecutionResult = "REJECTED: Out of business hours";
            } else if (slots.includes(finalTime) || (isTargetSaturday && finalTime === "08:30")) {
                session.target_time = finalTime;
                session.target_date = targetDate;
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
        const isHandoffRequest = lowerMsg.includes('hablar con la doctora') || lowerMsg.includes('hablar con la doc');

        // Detect Invoice Request
        const isInvoiceRequest = lowerMsg.includes('factura') || lowerMsg.includes('ruc') || lowerMsg.includes('datos de facturacion') || session.current_flow?.includes('Factura');

        if (isInvoiceRequest && !isHandoffRequest) {
            session.current_flow = "Solicitud de Factura";
            session.metadata = session.metadata || {};
            session.metadata.invoice = session.metadata.invoice || {};
            console.log(`[Logic] Invoice flow active. Current data: ${JSON.stringify(session.metadata.invoice)}`);
        } else if (isHandoffRequest) {
            console.log(`[Logic] Handoff TRIGGERED for ${cleanPhone}. Setting sleep mode.`);
            await db.execute('INSERT INTO handoff_sessions (phone, expires_at) VALUES (?, NOW() + INTERVAL 12 HOUR) ON DUPLICATE KEY UPDATE expires_at = NOW() + INTERVAL 12 HOUR', [cleanPhone]);
            availabilityContext += "\n[SISTEMA: EL BOT ENTRARÁ EN MODO SUEÑO DESPUÉS DE ESTE MENSAJE. Confirme al usuario que notificará a la doctora.]";
        }

        // Detectar si es el primer mensaje real de la conversación
        const isFirstMessage = history.length === 0;
        
        // Para mensajes agrupados, verificar si el PRIMERO es un saludo
        const firstLineOfMessage = messageText.split('\n')[0].trim().toLowerCase();
        const isGreetingOnly = firstLineOfMessage.match(/^(hola|buenos días|buenas|buenas tardes|buenas noches|hey|hi|hello)[\s!]*$/i);
        const hasQuestionOrIntent = (
            firstLineOfMessage.includes('cita') || firstLineOfMessage.includes('agendar') || 
            firstLineOfMessage.includes('hora') || firstLineOfMessage.includes('precio') || 
            firstLineOfMessage.includes('cuesta') || firstLineOfMessage.includes('quiero') ||
            firstLineOfMessage.includes('necesito') || firstLineOfMessage.includes('dolor') ||
            firstLineOfMessage.includes('duele') || firstLineOfMessage.includes('consulta') ||
            firstLineOfMessage.includes('bracket') || firstLineOfMessage.includes('limpieza') ||
            firstLineOfMessage.includes('muela') || firstLineOfMessage.includes('protesis') ||
            firstLineOfMessage.includes('factura') || firstLineOfMessage.includes('ruc')
        );
        const isSaludoConIntencion = isFirstMessage && (
            firstLineOfMessage.match(/^(hola|buenos|buenas)/i) && hasQuestionOrIntent
        );
        
        const greetingContext = isFirstMessage
            ? (isSaludoConIntencion
                ? "[SISTEMA - REGLA DE SALUDO OBLIGATORIA ABSOLUTA: Es el PRIMER mensaje y el usuario saluda + tiene intención clara. DEBES iniciar EXACTAMENTE con 'Gracias por comunicarse con Hexadent 🦷 ' seguido INMEDIATAMENTE de la respuesta a su solicitud. Ejemplo: 'Gracias por comunicarse con Hexadent 🦷 Con gusto le ayudamos. Los valores se tratan directamente con la doctora. ¿Desea agendar?' - NO uses otro saludo. NO omitas la frase obligatoria.]"
                : isGreetingOnly
                    ? "[SISTEMA - REGLA DE SALUDO OBLIGATORIA ABSOLUTA: Es el PRIMER mensaje y el usuario SOLO saluda. DEBES responder EXACTAMENTE: 'Gracias por comunicarse con Hexadent 🦷 ¿En qué podemos ayudarle?' - Sin cambios, sin variaciones, sin añadir nada más.]"
                    : "[SISTEMA - REGLA DE SALUDO OBLIGATORIA ABSOLUTA: Es el PRIMER mensaje. Aunque el usuario escriba varias cosas, DEBES iniciar EXACTAMENTE con 'Gracias por comunicarse con Hexadent 🦷 ' seguido de la respuesta apropiada.]"
              )
            : "[SISTEMA: Esta NO es la primera interacción. Ya saludaste antes. PROHIBIDO repetir el saludo inicial 'Gracias por comunicarse con Hexadent'. Continúa la conversación de forma natural.]";

        const patientContext = `PACIENTE: ${session.name || 'Desconocido'}, Cédula: ${session.cedula || 'Pendiente'}, Edad: ${session.age || 'Pendiente'}. Estado: ${session.current_flow}`;

        const systemPrompt = `
            ${personalityGuide}
            ${greetingContext}
            ${patientContext}
            ${securityRules}
            ${bookingRules}
            INSTRUCCIÓN DE MOTIVO: El motivo de consulta es OPCIONAL. Puedes preguntar "¿En qué podemos ayudarle?" o "¿Cuál es el motivo de su visita?" al inicio, pero si el usuario lo ignora o simplemente pide una cita, PROCEDE DIRECTAMENTE con los horarios. Si lo menciona, resúmelo en máximo 5 palabras para la agenda.
            ${metadataRules}
            ${knowledgeBase}
            ${skillInstructions}
            HOY ES ${dayEcu} ${dateStr} Y LA HORA ACTUAL ES ${timeStr}.
            ${availabilityContext}
            REGLA DE ORO: Si ves un horario en la lista de arriba, ¡ESTÁ DISPONIBLE! No contradigas al motor.
            REGLA DE ORO: Si NO hay horarios en la lista de arriba para una fecha, es porque todos los slots están ocupados o el día está cerrado/bloqueado. No inventes horarios.
            REGLA DE PRIORIDAD DE FECHAS: Cuando el usuario pide horarios "para hoy" y no hay disponibles (o es muy tarde), ofrece PRIMERO MAÑANA, luego pasado mañana, y solo si es necesario la próxima semana. NUNCA saltes directamente a "la próxima semana" si mañana o pasado están disponibles.
            REGLA DE FORMATO DE HORARIOS TARDE: Para horarios de la tarde (15:00-18:15), SIEMPRE menciona el rango completo (ej: "de 15:00 a 18:15" o "de 15:00 a las 18:15"). NUNCA digas solo "a partir de las 15:00" sin decir hasta cuándo. Si solo hay UNO o POCOS slots disponibles, indícalos directamente (ej: "Solo tenemos disponible a las 16:30"). NUNCA digas que no hay disponibilidad si ves al menos un horario en la lista de arriba.
            REGLA DE ORO: Si el usuario ya te dio el motivo (ej: dolor, limpieza), NO lo preguntes de nuevo. Procede directamente con la disponibilidad completa.
            REGLA DE ORO ABSOLUTA - HORARIOS FUERA DE RANGO: Si el sistema dice [ERROR CRÍTICO DE HORARIO], DEBES rechazar esa hora amablemente y pedir otra. NUNCA digas "buen horario" ni pidas datos si el horario es inválido.
            HORARIOS LÍMITE ESTRICTOS:
            - Lunes-Viernes: 09:00 a 13:00 y 15:00 a 18:15. EL ÚLTIMO TURNO POSIBLE ES A LAS 18:15.
            - Sábados: 08:30 a 15:00. EL ÚLTIMO TURNO POSIBLE ES A LAS 14:30.
            - DOMINGOS: CERRADO. Sin excepciones.
            REGLA DE FORMATO COMPACTO (MANDATORIA): Para evitar mensajes excesivamente largos, está PROHIBIDO listar cada día de la semana individualmente si tienen el mismo horario. 
            Muestra UN día de ejemplo (ej: "De lunes a viernes tenemos disponibilidad de 09:00 a 12:30 y de 15:00 a 18:15") y menciona el sábado por separado. SOLO lista días adicionales de forma individual si tienen huecos OCUPADOS que los diferencien del resto. El objetivo es que el paciente lea poco pero entienda todo.
            FRESCURA DE DATOS: Cada vez que el usuario mencione un nuevo día (ej: "la otra semana", "mañana"), los horarios de arriba CAMBIAN. NUNCA uses la lista de horarios de un mensaje anterior para el nuevo día. Si el sistema no te da horarios nuevos arriba, DILE al usuario que estás verificando y que sea más específico con la fecha.
            ANCLA DE TIEMPO: Todos los términos relativos ("mañana", "el lunes", "la otra semana") DEBEN calcularse desde HOY (${dayEcu} ${dateStr}), NUNCA desde una fecha agendada previamente en el historial.
            CIERRE DE MEDIODÍA (Lunes-Viernes): La jornada de la mañana termina a las 13:00. El último turno de la mañana empieza a las 12:30 (termina 13:15). A partir de las 13:15 hasta las 14:45 es horario de almuerzo. La jornada de la tarde reinicia a las 15:00.
            SÁBADOS (Jornada Continua): Los sábados se atiende de 08:30 a 15:00 SIN CIERRE al mediodía. NO los separes en "mañana" y "tarde" ni cortes a la 13:00; para el sistema todo el sábado es una sola jornada continua.
            CIERRE DE JORNADA: Muestra los horarios hasta el final (hasta las 18:15 de lunes a viernes, o hasta las 14:30 los sábados). Todos los turnos son de 45 minutos.
            CUIDADO CON LOS EMOJIS: Añade un espacio DESPUÉS de cada emoji (ej: "😊 ").
            REGLA DE PUNTUACIÓN DE PREGUNTAS: TODA pregunta DEBE iniciar con "¿" y terminar con "?". NUNCA dejes una pregunta sin cerrar. Ejemplo correcto: "¿En qué podemos ayudarle?" - Ejemplo PROHIBIDO: "¿En qué podemos ayudarle" o "En qué podemos ayudarle?"
            REGLA DE CARACTERES INVÁLIDOS: Si el mensaje tiene "?" sueltos que parecen errores de encoding (cuando debería haber un emoji), REEMPLÁZALOS con el emoji apropiado (😊, 👍, ✨) o elimínalos. NUNCA dejes "?" sueltos en el texto.
            LIMPIEZA DE CARACTERES: NUNCA termines un mensaje con "?" a menos que sea una pregunta completa con "¿" al inicio. NUNCA envíes el mensaje de saludo inicial si el sistema dice que NO es la primera interacción.

            MODO FACTURACIÓN:
            Si el estado es "Solicitud de Factura", TU OBJETIVO es recolectar: Nombre, RUC/Cédula, Dirección, Correo.
            1. Analiza el mensaje del usuario y extrae estos datos si están presentes.
            2. Si falta alguno, PÍDELO (puedes pedir todos juntos o por partes).
            3. Si tienes TODOS (Nombre, RUC, Dirección, Correo), responde: "¡Perfecto! He registrado sus datos de facturación. La doctora se encargará de colocar el servicio correspondiente y generarla. Estamos a las órdenes. 😊"
            4. IMPORTANTE: Genera un bloque JSON con los datos extraídos ASÍ: [META DATA: {"action": "update_invoice", "invoice": {"name": "...", "id": "...", "address": "...", "email": "..."}}]
            
            MODO CANCELACIÓN:
            Si el usuario confirma que NO asistirá a su cita (ej. responde 'No' al recordatorio) o solicita cancelar:
            1. Responde de forma muy profesional confirmando que has liberado el espacio.
            2. Genera un bloque JSON ASÍ: [META DATA: {"action": "cancel_appointment"}]
        `;


        const botResponse = await getChatCompletion([{ role: "system", content: systemPrompt }, ...history, { role: "user", content: messageText }], {
            temperature: 0.3
        });
        
        // CRITICAL FIX: If user gave name but no cedula, and LLM asks for more data → OVERRIDE
        // Check if user's message looks like a name (2-3 words, no numbers) and bot is asking for data
        const normalizedMsgForNameCheck = messageText.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); // Remove accents/diacritics
        const forbiddenWords = ['favor', 'por', 'gracias', 'ayuda', 'ayudeme', 'hola', 'buenos', 'dias', 'tardes', 'noches', 'quiero', 'cita', 'agendar', 'turno', 'hora', 'mas', 'tarde', 'temprano', 'adelantar', 'reagendar', 'cancelar', 'confirmar', 'doctora', 'doc', 'doctorita', 'esta', 'este', 'para', 'como', 'con', 'gusto', 'si', 'no'];
        const hasForbiddenWord = forbiddenWords.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(normalizedMsgForNameCheck);
        });
        const userMessageLooksLikeName = messageText.match(/^[a-zA-ZáéíóúñÑ\s]{5,40}$/) && 
                                        messageText.split(/\s+/).length >= 2 &&
                                        !messageText.match(/\d{5,}/) &&
                                        !hasForbiddenWord;
        const userConfirmingSi = messageText.toLowerCase().trim() === 'si' || 
                                 messageText.toLowerCase().trim() === 'sí' ||
                                 messageText.toLowerCase().trim() === 'si confirmo' ||
                                 messageText.toLowerCase().trim() === 'confirmo' ||
                                 messageText.toLowerCase().trim() === 'si, confirmo';
        const botAskingForData = botResponse.includes('cédula') || botResponse.includes('edad') || botResponse.includes('datos');
        
        let finalResponseText;
        if (userMessageLooksLikeName && botAskingForData && session.target_date && session.target_time) {
            console.log(`[Logic] OVERRIDE: User message looks like name. Forcing confirmation.`);
            session.name = messageText.trim(); // Save the detected name to the session!
            
            const targetDateObj = new Date(session.target_date + 'T12:00:00-05:00');
            const diaSemana = targetDateObj.toLocaleDateString('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' });
            const diaNum = session.target_date.split('-')[2];
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const mes = meses[targetDateObj.getMonth()];
            const fechaFormateada = `${diaSemana} ${diaNum} de ${mes}`;
            
            const firstName = messageText.split(' ')[0];
            finalResponseText = `Perfecto${firstName ? ', ' + firstName : ''}. 🦷 ¿Confirma su cita para el ${fechaFormateada} a las ${session.target_time}?`;
        } else if (userConfirmingSi && botAskingForData && session.target_date && session.target_time) {
            // User said "Si" to confirm but bot still asking for data → create appointment directly
            console.log(`[Logic] OVERRIDE: User confirmed with "Si" but bot still asking for data. Creating appointment.`);
            
            // DIRECT INSERT - bypass checkAvailability which has the lock bug
            try {
                // Cancel any existing appointments for this patient on this date
                await db.execute(
                    'UPDATE appointments SET status = "cancelled" WHERE patient_phone = ? AND appointment_date = ? AND status = "scheduled"',
                    [cleanPhone, session.target_date]
                );
                
                // Insert directly
                const [result] = await db.execute(
                    'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled", ?)',
                    [session.name || 'Paciente', cleanPhone, session.cedula || null, session.age || null, session.target_date, session.target_time, 45, session.motive || 'Consulta General']
                );
                
                session.current_flow = "Agendamiento completado";
                finalResponseText = `¡Excelente! Su cita ha sido agendada. 🦷\n\n📅 Fecha: ${session.target_date}\n🕐 Hora: ${session.target_time}\n📍 Ubicación: Calle Lourdes, entre Bolívar y Sucre, San Sebastián (Loja)\n\nLe esperamos puntual. ¿Necesita algo más? 😊`;
            } catch (bookErr) {
                console.error(`[Booking Error] ${bookErr.message}`);
                finalResponseText = `Lo siento, no pude agendar la cita. ¿Desea elegir otro horario? 😊`;
            }
        } else {
            // Normal processing
            finalResponseText = botResponse.replace(/\[META\s*DATA:.*?\]/gi, '').trim();
        }
        
        // Anti-Repetitive Greeting: If the system said it's NOT the first message, and the LLM still sent the greeting, strip it.

        // Anti-Repetitive Greeting: If the system said it's NOT the first message, and the LLM still sent the greeting, strip it.
        if (!isFirstMessage) {
            const greetingPrefix1 = "Gracias por comunicarse con Hexadent 🦷";
            const greetingPrefix2 = "Gracias por comunicarte con Hexadent";
            const greetingPrefix3 = "¡Hola!";
            const greetingPrefix4 = "Hola,";
            if (finalResponseText.startsWith(greetingPrefix1)) {
                finalResponseText = finalResponseText.replace(greetingPrefix1, '').trim();
                console.log("[Logic] Repetitive greeting STRIPPED (correct format).");
            } else if (finalResponseText.startsWith(greetingPrefix2)) {
                finalResponseText = finalResponseText.replace(greetingPrefix2, '').trim();
                console.log("[Logic] Repetitive greeting STRIPPED (alternate format).");
            } else if (finalResponseText.startsWith(greetingPrefix3)) {
                finalResponseText = finalResponseText.replace(greetingPrefix3, '').trim();
                console.log("[Logic] Generic '¡Hola!' greeting STRIPPED.");
            } else if (finalResponseText.startsWith(greetingPrefix4)) {
                finalResponseText = finalResponseText.replace(greetingPrefix4, '').trim();
                console.log("[Logic] Generic 'Hola,' greeting STRIPPED.");
            }
        }
        
        // VALIDACIÓN: En el primer mensaje, asegurar que el saludo correcto esté presente
        if (isFirstMessage) {
            const requiredGreeting = "Gracias por comunicarse con Hexadent 🦷";
            const trimmedText = finalResponseText.trim();
            // Verificar si empieza con el saludo (ignorando posibles caracteres inválidos al inicio)
            const hasGreeting = trimmedText.startsWith(requiredGreeting) || 
                               trimmedText.startsWith("Gracias por comunicarse") ||
                               trimmedText.match(/^[^a-zA-ZÁÉÍÓÚáéíóúñÑ]*Gracias/i);
            
            if (!hasGreeting) {
                // Si el LLM no puso el saludo correcto, lo forzamos al inicio
                console.log(`[Logic] WARNING: First message without proper greeting. Forcing prefix. Raw: "${finalResponseText.substring(0, 80)}..."`);
                // Limpiar cualquier saludo genérico previo y forzar el correcto
                finalResponseText = `${requiredGreeting} ${trimmedText.replace(/^\s*(Hola|¡Hola|Buenas|Buenos)[\s,!]*/i, '').trim()}`;
                console.log(`[Logic] FORCED GREETING: "${finalResponseText.substring(0, 80)}..."`);
            } else if (!trimmedText.startsWith(requiredGreeting)) {
                // Tiene "Gracias" pero no el formato exacto, corregirlo
                console.log(`[Logic] WARNING: Greeting exists but malformed. Fixing...`);
                finalResponseText = trimmedText.replace(/^[^a-zA-ZÁÉÍÓÚáéíóúñÑ]*Gracias[^🦷]*(?:🦷)?/i, requiredGreeting).trim();
                console.log(`[Logic] FIXED GREETING: "${finalResponseText.substring(0, 80)}..."`);
            } else {
                console.log("[Logic] First message greeting VALIDATED.");
            }
        }

        // LIMPIEZA DE PUNTUACIÓN Y CARACTERES INVÁLIDOS - ORDEN CRÍTICO
        
        // 1. Detectar "?" precedidos por espacio que suelen ser emojis rotos (ej: "texto ?")
        finalResponseText = finalResponseText.replace(/\s\?(?=[\s.!]|$)/g, () => Math.random() > 0.5 ? ' 😊' : ' 🦷');
        
        // 2. Detectar ? que está entre palabras (no al final) y parece error de encoding
        finalResponseText = finalResponseText.replace(/([a-záéíóúñA-ZÁÉÍÓÚÑ])\?([a-záéíóúñA-ZÁÉÍÓÚÑ])/gi, '$1$2');  // ? entre letras -> quitar
        
        // 3. Detectar si hay preguntas sin cerrar y corregir ANTES de manejar emojis
        if (finalResponseText.includes('¿') && !finalResponseText.trim().endsWith('?')) {
            const lastPart = finalResponseText.substring(finalResponseText.lastIndexOf('¿'));
            if (!lastPart.includes('?')) {
                finalResponseText = finalResponseText.trim() + '?';
                console.log("[Logic] Fixed unclosed question mark.");
            }
        }
        
        // 4. Si termina con ? pero NO tiene ¿ en todo el mensaje, casi seguro es un emoji roto al final
        if (!finalResponseText.includes('¿') && finalResponseText.trim().endsWith('?')) {
            const randomEmoji = Math.random() > 0.5 ? ' 😊' : ' 🦷';
            finalResponseText = finalResponseText.replace(/\?\s*$/g, randomEmoji);
        }
        
        // 5. Si hay ? entre frases (que parece error), reemplazar con emoji
        // Pero preservar las preguntas legítimas que ya tienen ¿ y ?
        finalResponseText = finalResponseText.replace(/\?\s+(?=[A-ZÁÉÍÓÚ])/g, (match) => {
            return finalResponseText.includes('¿') ? match : (Math.random() > 0.5 ? ' 🦷 ' : ' 😊 ');
        });
        
        // 6. Asegurar espaciado correcto de emojis alrededor de puntuación
        finalResponseText = finalResponseText.replace(/\s+([😊🦷✨])\s*\?/g, '? $1'); // Si hay emoji antes del ?, moverlo después
        finalResponseText = finalResponseText.replace(/\?\s*\?/g, '?'); // Eliminar signos de interrogación dobles
        
        // 7. Si termina con ? pero sin emoji, añadir uno amigable alternando
        if (finalResponseText.trim().endsWith('?') && !finalResponseText.match(/[😊🦷✨]/)) {
            const randomEmoji = Math.random() > 0.5 ? ' 😊' : ' 🦷';
            finalResponseText = finalResponseText.trim() + randomEmoji;
        }

        // 8. Remove trailing trash characters
        finalResponseText = finalResponseText.replace(/[\uFFFD\s]+$/, ' ').trim();

        // 9. Ensure emoji spacing
        finalResponseText = finalResponseText.replace(/([^\s])([\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}])/gu, '$1 $2');
        finalResponseText = finalResponseText.replace(/([\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}])([^\s])/gu, '$1 $2');
        
        // 10. Remove double spaces
        finalResponseText = finalResponseText.replace(/\s{2,}/g, ' ').trim();

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

        if (metadata && metadata.action === 'cancel_appointment') {
            console.log(`[Logic] Metadata action is cancel_appointment for ${cleanPhone}`);
            try {
                const canceled = await cancelAppointment(cleanPhone);
                if (canceled) {
                    session.current_flow = "Cita cancelada";
                    toolExecutionResult = `CANCELLATION SUCCESS`;
                } else {
                    console.log(`[Logic] No pending appointments found to cancel for ${cleanPhone}`);
                }
            } catch (err) {
                console.error(`[Cancellation Error] ${err.message}`);
            }
        }

        // Fallback: If no metadata but bot said "confirmed"
            // Also allow if _skipDataRequest is true (name was given but not cedula)
            const canProceedWithoutFullData = session._skipDataRequest && session.name && session.target_date && session.target_time;
            
            if (!metadata && (
                botResponse.toLowerCase().includes('agendada') ||
                botResponse.toLowerCase().includes('confirmada') ||
                botResponse.toLowerCase().includes('agendado') ||
                botResponse.toLowerCase().includes('confirmado')
            )) {
                console.log(`[Logic] No metadata but bot said "confirmed". Attempting session fallback...`);
                const isChild = (session.age && session.age < 12);
                if (session.target_date && session.target_time && (isChild || session.cedula || idMatch || canProceedWithoutFullData)) {
                    metadata = {
                        action: "create_appointment",
                        name: session.name || "Paciente",
                        cedula: isChild ? "MENOR" : (session.cedula || (idMatch ? idMatch[1] : null)),
                        age: session.age,
                        date: session.target_date,
                        time: session.target_time,
                        motive: "Consulta Dental"
                    };
                    console.log(`[Logic] Session fallback SUCCESS: ${JSON.stringify(metadata)}`);
                } else {
                    console.log(`[Logic] Session fallback FAILED. Missing data: Date:${session.target_date}, Time:${session.target_time}, Cedula:${session.cedula}`);
                }
            }

        if (metadata && metadata.action === 'create_appointment' && !bookingExecuted) {
            console.log(`[Logic] Metadata action is create_appointment. Metadata: ${JSON.stringify(metadata)}`);
            if (metadata.name) session.name = metadata.name;
            if (metadata.cedula) session.cedula = metadata.cedula;
            if (metadata.age) session.age = metadata.age;
            const isChild = (metadata.age && metadata.age < 12) || (session.age && session.age < 12);

            // RE-EXTRACTION GUARD: If the LLM's metadata cedula fails validation,
            // try to extract a fresh 10-digit number directly from the user's latest message.
            let cedulaToUse = metadata.cedula;
            if (!isChild && cedulaToUse && !validateCedula(cedulaToUse)) {
                console.log(`[Logic] LLM cedula '${cedulaToUse}' FAILED validation. Attempting re-extraction from message...`);
                const freshIdMatch = messageText.match(/\b(\d{10})\b/);
                if (freshIdMatch && validateCedula(freshIdMatch[1])) {
                    cedulaToUse = freshIdMatch[1];
                    metadata.cedula = cedulaToUse;
                    session.cedula = cedulaToUse;
                    console.log(`[Logic] Re-extracted valid cedula from message: ${cedulaToUse}`);
                }
            }

            const hasValidId = isChild || (cedulaToUse && validateCedula(cedulaToUse));

            // DEBUG: Log what we have
            console.log(`[DEBUG-FLOW] metadata.name: "${metadata.name}", hasValidId: ${hasValidId}, isChild: ${isChild}`);
            console.log(`[DEBUG-FLOW] cedulaToUse: "${cedulaToUse}", validateCedula result: ${cedulaToUse ? validateCedula(cedulaToUse) : 'N/A'}`);

            // NAME IS MANDATORY, CEDULA/AGE ARE OPTIONAL FOR SPEED
            // If we have name but not full data, force confirmation instead of asking for more
            if (!metadata.name) {
                console.log(`[Logic] Name is missing. Asking for patient data.`);
                finalResponseText = isChild
                    ? "Para agendar al pequeño, por favor confírmeme su nombre y el nombre del representante. 😊"
                    : "Para agendar su cita, ¿podría indicarme su nombre completo? 😊";
                bookingExecuted = true; // STOP here, don't try to book
            } else if (!hasValidId) {
                // Name exists but no valid ID → ask for CONFIRMATION directly (NOT more data)
                console.log(`[Logic] Name present but no valid ID. Forcing confirmation flow.`);
                
                // Format date nicely in Spanish
                const targetDateObj = new Date(session.target_date + 'T12:00:00-05:00');
                const diaSemana = targetDateObj.toLocaleDateString('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' });
                const diaNum = session.target_date.split('-')[2];
                const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                const mes = meses[targetDateObj.getMonth()];
                const fechaFormateada = `${diaSemana} ${diaNum} de ${mes}`;
                
                finalResponseText = `Perfecto${metadata.name ? ', ' + metadata.name.split(' ')[0] : ''}. 🦷 ¿Confirma su cita para el ${fechaFormateada} a las ${session.target_time}?`;
                bookingExecuted = true; // STOP here, don't ask LLM
            } else {
                // Full data available, proceed normally
                session._skipDataRequest = false;
            }
            
            // Only proceed to booking if we have valid data (or are skipping validation)
            if (!bookingExecuted) {
                // Ensure we use the date from session if metadata didn't catch it correctly
                const finalDate = metadata.date || session.target_date;
                const finalTime = metadata.time || session.target_time;

                // SANITIZATION: Convert undefined to null to prevent MySQL crash
                const sanitizedDetails = {
                    name: metadata.name || session.name || null,
                    phone: cleanPhone,
                    cedula: isChild ? "MENOR" : (cedulaToUse || session.cedula || null),
                    age: metadata.age || session.age || null,
                    date: finalDate,
                    time: finalTime,
                    duration: 45,
                    motive: metadata.motive || session.motive || "Consulta General"
                };

                console.log(`[Booking Attempt] Final Params: ${JSON.stringify(sanitizedDetails)}`);

                try {
                    // Check if appointment already exists for this user at this time
                    const [existingAppt] = await db.execute(
                        'SELECT id FROM appointments WHERE patient_phone = ? AND appointment_date = ? AND appointment_time = ? AND status = "scheduled"',
                        [cleanPhone, finalDate, finalTime]
                    );

                    if (existingAppt.length > 0) {
                        console.log(`[Logic] Appointment already exists for ${cleanPhone} on ${finalDate} at ${finalTime}. Skipping creation.`);
                        session.current_flow = "Agendamiento completado";
                        toolExecutionResult = `SUCCESS (Already existed: ${existingAppt[0].id})`;
                    } else {
                        const booking = await bookAppointment(sanitizedDetails);
                        if (booking.success) {
                            session.current_flow = "Agendamiento completado";
                            toolExecutionResult = `SUCCESS (ID: ${booking.id})`;
                        } else {
                            finalResponseText = `Lo siento, ese horario ya no está disponible. ¿Le gustaría elegir otro horario? 😊`;
                        }
                    }
                } catch (bookErr) {
                    console.error(`[Booking Error] ${bookErr.message}`);
                    finalResponseText = `Lo siento, hubo un problema al registrar su cita: ese horario ya no está disponible. ¿Le gustaría elegir otro horario? 😊`;
                }
            }
            bookingExecuted = true;
        }

        await saveSession(cleanPhone, session);
        await logActivity(cleanPhone, messageText, botResponse, toolExecutionResult);
        await sendEvolutionWhatsApp(phoneNumber, finalResponseText);

        return { success: true, botResponse: botResponse };
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
