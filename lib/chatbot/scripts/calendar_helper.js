import db from '../../db.js';

console.log(">>> [LOAD] Loading lib/chatbot/scripts/calendar_helper.js (HARDENED V4)");

export async function getAvailableSlots(dateStr, durationMin = 45, excludePhone = null, isAdmin = false) {
    try {
        const dateObj = new Date(`${dateStr}T12:00:00Z`);
        const dayOfWeek = dateObj.getUTCDay();

        if (dayOfWeek === 0) return []; // Sunday

        // PAST DATE GUARD: Reject any date before today (Ecuador time)
        const nowEcu = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guayaquil' }));
        const todayStr = `${nowEcu.getFullYear()}-${(nowEcu.getMonth() + 1).toString().padStart(2, '0')}-${nowEcu.getDate().toString().padStart(2, '0')}`;

        // Admins can see slots for today even if lead time has passed, but not for past days
        if (!isAdmin && dateStr < todayStr) {
            console.log(`[Calendar Helper] REJECTED: ${dateStr} is in the PAST (today is ${todayStr})`);
            return [];
        }

        // 6-MONTH WINDOW GUARD: Reject dates more than 6 months out
        const maxDate = new Date(nowEcu);
        maxDate.setMonth(maxDate.getMonth() + 6);
        const maxStr = `${maxDate.getFullYear()}-${(maxDate.getMonth() + 1).toString().padStart(2, '0')}-${maxDate.getDate().toString().padStart(2, '0')}`;
        if (dateStr > maxStr) {
            console.log(`[Calendar Helper] REJECTED: ${dateStr} is too far in the future (max: ${maxStr})`);
            return [];
        }

        // BLOCKED DATE CHECK: Use CAST to ensure proper date comparison
        const [blocked] = await db.execute('SELECT reason FROM blocked_dates WHERE DATE(blocked_date) = ?', [dateStr]);
        if (blocked.length > 0) {
            console.log(`[Calendar Helper] Date ${dateStr} is BLOCKED. Reason: ${blocked[0].reason}`);
            return [];
        }

        // Default: 9:00 to 18:00. Allowed last slot at 17:30 (ends 18:15)
        let startH = 9, startM = 0, endH = 18, endM = 15;
        let lunchHStart = 13, lunchMStart = 15, lunchHEnd = 15; // Lunch starts at 13:15 for the bot

        if (dayOfWeek === 6) { // Saturday
            // 8:30 to 15:00. Allowed last slot at 14:30 (ends 15:15)
            startH = 8; startM = 30;
            endH = 15; endM = 15;
            lunchHStart = null;
        }

        const makeEcuTs = (h, m) => {
            const d = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00-05:00`);
            return d.getTime();
        };

        const startTs = makeEcuTs(startH, startM);
        const limitTs = makeEcuTs(endH, endM);

        const nowTs = Date.now();
        const leadLimitTs = nowTs + (8 * 60 * 60 * 1000); // 8-hour lead time rule

        const [appts] = await db.execute('SELECT appointment_time, duration_minutes FROM appointments WHERE appointment_date = ? AND status != "cancelled"', [dateStr]);
        const [locks] = await db.execute('SELECT time, locked_by FROM chatbot_locked_slots WHERE date = ? AND locked_at > NOW() - INTERVAL 5 MINUTE', [dateStr]);

        const parseTimeStr = (t) => {
            if (!t) return [0, 0];
            if (t instanceof Date) {
                return [t.getUTCHours(), t.getUTCMinutes()];
            }
            const [h, m] = t.split(':').map(Number);
            return [h, m];
        };

        const busySlots = [
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
        const stepMs = 15 * 60 * 1000; // Check every 15 minutes for flexibility

        while (currentTs + durationMs <= limitTs) {
            const nextTs = currentTs + durationMs;
            const ecuDate = new Date(currentTs - (5 * 60 * 60 * 1000));
            const h = ecuDate.getUTCHours();
            const m = ecuDate.getUTCMinutes();
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            let isBlocked = false;

            // Lunch break check
            let currentLunchStartTs = null;
            if (lunchHStart !== null) {
                currentLunchStartTs = makeEcuTs(lunchHStart, lunchMStart);
                const lunchEndTs = makeEcuTs(lunchHEnd, 0);
                if (currentTs < lunchEndTs && nextTs > currentLunchStartTs) {
                    isBlocked = true;
                }
            }

            // Filter: We only want slots that are:
            // 1. Aligned to the 45-min grid starting from day start
            // 2. OR end exactly at lunch start
            // 3. OR end exactly at the end of the day
            const isAligned = (currentTs - startTs) % (45 * 60 * 1000) === 0;
            const endsAtLunch = currentLunchStartTs && nextTs === currentLunchStartTs;
            const endsAtDayLimit = nextTs === limitTs;

            if (!isAligned && !endsAtLunch && !endsAtDayLimit) {
                isBlocked = true;
            }

            // Lead time rule (8 hours) - Bypassed for admins
            if (!isAdmin && currentTs < leadLimitTs) {
                isBlocked = true;
            }

            // Admins can book slightly in the past (up to 1 hour ago) for current day record keeping
            if (isAdmin && currentTs < (nowTs - (60 * 60 * 1000))) {
                isBlocked = true;
            }

            if (busySlots.some(b => (currentTs < b.end && nextTs > b.start))) isBlocked = true;

            if (!isBlocked) {
                available.push(timeStr);
            }
            currentTs += stepMs;
        }

        return available;
    } catch (e) {
        console.error("[Calendar Helper] Absolute Error (DB Hang?):", e);
        return [];
    }
}

export async function checkAvailability(date, time, durationMin = 20, excludePhone = null, isAdmin = false) {
    const slots = await getAvailableSlots(date, durationMin, excludePhone, isAdmin);
    return slots.includes(time);
}

export async function lockSlot(phone, date, time) {
    const cleanPhone = phone.replace(/\D/g, '');
    await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);
    await db.execute('INSERT INTO chatbot_locked_slots (date, time, locked_by) VALUES (?, ?, ?)', [date, time, cleanPhone]);
    return true;
}

export async function bookAppointment(details, isAdmin = false) {
    let { name, phone = "", cedula, age, date, time, duration = 45, motive = "" } = details;

    // For manual bookings, phone might be empty. DB requires it.
    if (!phone && isAdmin) {
        phone = `MANUAL_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    const cleanPhone = phone.replace(/\D/g, '') || phone; // Keep MANUAL string if not numbers

    const isAvail = await checkAvailability(date, time, duration, cleanPhone, isAdmin);
    if (!isAvail) throw new Error("Horario no disponible.");

    // Regular bot bookings cancel previous pending appointments for the same phone.
    // Manual bookings (isAdmin) skip this to allow one patient to have multiple appointments if registered manually.
    if (!isAdmin) {
        await db.execute('UPDATE appointments SET status = "cancelled" WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE()', [phone]);
        await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled", ?)',
            [name, phone, cedula, age, date, time, duration, motive]
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

export async function cancelAppointment(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const [result] = await db.execute(
        'UPDATE appointments SET status = "cancelled" WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE()',
        [phone]
    );
    await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);
    return result.affectedRows > 0;
}
