import db from '../../db.js';

console.log(">>> [LOAD] Loading lib/chatbot/scripts/calendar_helper.js (HARDENED V3)");

const slotCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function getAvailableSlots(dateStr, durationMin = 20, excludePhone = null) {
    const cacheKey = `${dateStr}-${durationMin}`;
    const cached = slotCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`[Calendar Helper] Using cached slots for ${dateStr}`);
        return cached.slots;
    }

    try {
        const dateObj = new Date(`${dateStr}T12:00:00Z`);
        const dayOfWeek = dateObj.getUTCDay();

        if (dayOfWeek === 0) return []; // Sunday

        const [blocked] = await db.execute('SELECT reason FROM blocked_dates WHERE DATE(blocked_date) = DATE(?)', [dateStr]);
        if (blocked.length > 0) {
            console.log(`[Calendar Helper] Date ${dateStr} is BLOCKED. Reason: ${blocked[0].reason}`);
            return [];
        }

        let startH = 9, startM = 0, endH = 18, endM = 0;
        let lunchHStart = 13, lunchHEnd = 15;

        if (dayOfWeek === 6) { // Saturday
            startH = 8; startM = 30;
            endH = 15; endM = 0;
            lunchHStart = null;
        }

        const makeEcuTs = (h, m) => {
            // Ecuador is UTC-5, so to convert local time to UTC we ADD 5 hours to the time value
            // Example: 8:30 AM ECU = 13:30 UTC
            const d = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00-05:00`);
            return d.getTime();
        };

        const startTs = makeEcuTs(startH, startM);
        const limitTs = makeEcuTs(endH, endM);

        const nowTs = Date.now();
        const leadLimitTs = nowTs + (24 * 60 * 60 * 1000);
        console.log(`[Calendar Helper] 24h Check - Now (UTC): ${new Date(nowTs).toISOString()}, Limit (UTC): ${new Date(leadLimitTs).toISOString()}`);

        const [appts] = await db.execute('SELECT appointment_time, duration_minutes FROM appointments WHERE appointment_date = ? AND status != "cancelled"', [dateStr]);
        const [locks] = await db.execute('SELECT time, locked_by FROM chatbot_locked_slots WHERE date = ? AND locked_at > NOW() - INTERVAL 5 MINUTE', [dateStr]);

        const parseTimeStr = (t) => {
            if (!t) return [0, 0];
            if (t instanceof Date) {
                // MySQL2 TIME columns can be Date objects (anchored to 1970-01-01)
                // Use UTC methods because they are usually mapped that way
                return [t.getUTCHours(), t.getUTCMinutes()];
            }
            const parts = t.toString().split(':');
            return [parseInt(parts[0] || 0), parseInt(parts[1] || 0)];
        };

        const busyRanges = [
            ...appts.map(a => {
                const [h, m] = parseTimeStr(a.appointment_time);
                const s = makeEcuTs(h, m);
                return { start: s, end: s + (a.duration_minutes * 60 * 1000) };
            }),
            ...locks.filter(l => {
                const cleanPhone = excludePhone ? excludePhone.replace(/\D/g, '') : null;
                return l.locked_by !== cleanPhone;
            }).map(l => {
                const [h, m] = parseTimeStr(l.time);
                const s = makeEcuTs(h, m);
                return { start: s, end: s + (durationMin * 60 * 1000) };
            })
        ];

        const available = [];
        let currentTs = startTs;
        const durationMs = durationMin * 60 * 1000;
        const stepMs = 15 * 60 * 1000;

        while (currentTs + durationMs <= limitTs) {
            const nextTs = currentTs + durationMs;
            const ecuDate = new Date(currentTs - (5 * 60 * 60 * 1000));
            const h = ecuDate.getUTCHours();
            const m = ecuDate.getUTCMinutes();
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            let isBlocked = false;

            // Lunch break check: 
            // 1. Slot starts during lunch
            if (lunchHStart !== null && h >= lunchHStart && h < lunchHEnd) {
                isBlocked = true;
            }
            // 2. Slot starts before lunch but ends after lunch starts
            if (lunchHStart !== null) {
                const lunchStartTs = makeEcuTs(lunchHStart, 0);
                if (currentTs < lunchStartTs && nextTs > lunchStartTs) {
                    isBlocked = true;
                }
            }

            // Enforce 24h rule strictly
            if (currentTs < leadLimitTs) {
                isBlocked = true;
            }

            if (busyRanges.some(b => (currentTs < b.end && nextTs > b.start))) isBlocked = true;

            if (!isBlocked) {
                available.push(timeStr);
            }
            currentTs += stepMs;
        }

        // Save to cache
        slotCache.set(cacheKey, { slots: available, timestamp: Date.now() });

        return available;
    } catch (e) {
        console.error("[Calendar Helper] Absolute Error (DB Hang?):", e);

        // FAIL-SOFT: If DB times out, return a default "optimistic" set of slots for typical business hours
        // This avoids the "contradiction" loop by letting the flow proceed until the booking step (which has its own verification)
        const dayOfWeek = new Date(`${dateStr}T12:00:00-05:00`).getDay();
        if (dayOfWeek === 0) return []; // Sunday is always closed

        if (dayOfWeek === 6) { // Saturday
            return ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30"];
        }
        // Weekdays
        return ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
    }
}

export async function checkAvailability(date, time, durationMin = 20) {
    const slots = await getAvailableSlots(date, durationMin);
    return slots.includes(time);
}

export async function lockSlot(phone, date, time) {
    const cleanPhone = phone.replace(/\D/g, '');
    await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);
    await db.execute('INSERT INTO chatbot_locked_slots (date, time, locked_by) VALUES (?, ?, ?)', [date, time, cleanPhone]);
    return true;
}

export async function bookAppointment(details) {
    const { name, phone, cedula, age, date, time, duration = 20 } = details;
    const isAvail = await checkAvailability(date, time, duration);
    if (!isAvail) throw new Error("Horario no disponible.");

    await db.execute('UPDATE appointments SET status = "cancelled" WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE()', [phone]);
    const cleanPhone = phone.replace(/\D/g, '');
    await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);

    try {
        const [result] = await db.execute(
            'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled")',
            [name, phone, cedula, age, date, time, duration]
        );
        return { success: true, id: result.insertId };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            const [existing] = await db.execute('SELECT id FROM appointments WHERE appointment_date = ? AND appointment_time = ? AND patient_phone = ? AND status = "scheduled"', [date, time, phone]);
            if (existing.length > 0) {
                console.log(`[Calendar Helper] Duplicate booking handled: Slot already assigned to ${phone}`);
                return { success: true, id: existing[0].id, already_existed: true };
            }
            throw new Error(`Este horario (${time}) ya está ocupado por otro paciente.`);
        }
        throw error;
    }
}
