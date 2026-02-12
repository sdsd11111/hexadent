import db from '../../db.js';

console.log(">>> [LOAD] Loading lib/chatbot/scripts/calendar_helper.js");

/**
 * Get all available slots for a specific day.
 * Assumes working hours 09:00 - 13:00 and 15:00 - 18:00 (UTC-5)
 * Saturdays 08:30 - 15:00
 */
export async function getAvailableSlots(dateStr, durationMin = 20, excludePhone = null) {
    try {
        // console.log(`[DEBUG] getAvailableSlots for ${dateStr}`);

        // 1. Check for Sunday (Closed)
        // const dayOfWeek calculation moved inside loop context in original logic but needed here for checks
        const dateObj = new Date(`${dateStr}T00:00:00-05:00`);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        if (dayOfWeek === 0) return [];

        // 2. Check if date is manually blocked
        const [blocked] = await db.execute('SELECT 1 FROM blocked_dates WHERE blocked_date = ?', [dateStr]);
        if (blocked.length > 0) return [];

        // 3. Define hours based on day
        let startHour, endHour, lunchStart, lunchEnd;
        if (dayOfWeek === 6) { // Saturday
            startHour = 8.5; // 08:30
            endHour = 15; // 15:00
            lunchStart = null;
            lunchEnd = null;
        } else { // Monday to Friday
            startHour = 9;
            endHour = 18; // 18:00
            lunchStart = 13;
            lunchEnd = 15;
        }

        const startDay = new Date(`${dateStr}T${dayOfWeek === 6 ? '08:30' : '09:00'}:00-05:00`);
        const limitDate = new Date(`${dateStr}T${dayOfWeek === 6 ? '15:00' : '18:00'}:00-05:00`);

        // 4. Fetch busy slots from DB
        let query = 'SELECT appointment_time, duration_minutes FROM appointments WHERE appointment_date = ? AND status != "cancelled"';
        let params = [dateStr];

        if (excludePhone) {
            query += ' AND patient_phone != ?';
            params.push(excludePhone);
        }

        const [appointments] = await db.execute(query, params);

        // 4.1 Fetch locked slots (expiring in 5 mins handled by cleanup, but check here too)
        const [locks] = await db.execute(
            'SELECT time, locked_by FROM chatbot_locked_slots WHERE date = ? AND locked_at > NOW() - INTERVAL 5 MINUTE',
            [dateStr]
        );

        const requestedDurationMs = durationMin * 60 * 1000;
        const busySlots = [
            ...appointments.map(a => {
                const start = new Date(`${dateStr}T${a.appointment_time}-05:00`);
                const end = new Date(start.getTime() + a.duration_minutes * 60 * 1000);
                return { start, end };
            }),
            ...locks.filter(l => l.locked_by !== excludePhone).map(l => {
                const start = new Date(`${dateStr}T${l.time}-05:00`);
                const end = new Date(start.getTime() + requestedDurationMs);
                return { start, end };
            })
        ];

        const available = [];
        let current = new Date(startDay.getTime());
        const incrementMs = 15 * 60 * 1000;

        // TIMEZONE HARDENING: Use Intl for robust Ecuador time
        const ecuadorTime = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
        const nowEcu = new Date(ecuadorTime);
        const leadTimeMs = 24 * 60 * 60 * 1000; // 24 hours
        const earliestPossibleDate = new Date(nowEcu.getTime() + leadTimeMs);

        // CRITICAL FIX: Check 24h rule at DATE level, not slot level
        // If the requested date is less than 24h from now, reject ALL slots for that day
        const requestedDateStart = new Date(`${dateStr}T00:00:00-05:00`);
        if (requestedDateStart < earliestPossibleDate) {
            console.log(`[Calendar] Date ${dateStr} is within 24h lead time. Rejecting all slots.`);
            return [];
        }

        while (current.getTime() + requestedDurationMs <= limitDate.getTime()) {
            // DEBUG LOG
            // console.log(`checking...`);
            const next = new Date(current.getTime() + requestedDurationMs);

            // Decimal hour check for lunch break
            const dayStartForHour = new Date(`${dateStr}T00:00:00-05:00`).getTime();
            const elapsedMs = current.getTime() - dayStartForHour;
            const decimalHour = elapsedMs / (60 * 60 * 1000);
            const endDecimalHour = (next.getTime() - dayStartForHour) / (1000 * 60 * 60);

            let inLunch = false;
            if (lunchStart !== null && decimalHour < lunchEnd && endDecimalHour > lunchStart) {
                inLunch = true;
            }

            if (inLunch) {
                // console.log(`Slot ${current.toLocaleTimeString()} skipped (LUNCH)`);
                current = new Date(current.getTime() + incrementMs);
                continue;
            }

            const isBusy = busySlots.some(busy => (current < busy.end && next > busy.start));
            if (isBusy) {
                // console.log(`Slot ${current.toLocaleTimeString()} skipped (BUSY)`);
            }

            if (!isBusy) {
                const timeString = current.toLocaleTimeString('es-EC', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'America/Guayaquil'
                });
                available.push(timeString);
            }
            current = new Date(current.getTime() + incrementMs);
        }

        return available;
    } catch (error) {
        console.error('[Internal Calendar] Slots Error:', error);
        return [];
    }
}

/**
 * Check if a specific slot is available.
 */
export async function checkAvailability(date, time, durationMin = 20) {
    try {
        const slots = await getAvailableSlots(date, durationMin);
        return slots.includes(time);
    } catch (error) {
        console.error('[Internal Calendar] Availability Error:', error);
        return false;
    }
}

/**
 * Book an appointment in the database.
 */
export async function bookAppointment(details) {
    const { name, phone, cedula, age, date, time, duration = 20 } = details;
    console.log('[Internal Calendar] Attempting to book:', details);

    try {
        // ... backend guards
        const dateObj = new Date(`${date}T00:00:00-05:00`);
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek === 0) throw new Error("Cerrado los domingos.");

        // Check if date is blocked
        const [blocked] = await db.execute('SELECT 1 FROM blocked_dates WHERE blocked_date = ?', [date]);
        if (blocked.length > 0) throw new Error("Este día no laboramos atendiendo citas.");

        // Check if slot is still available
        const isAvailable = await checkAvailability(date, time, duration);
        if (!isAvailable) throw new Error("El horario ya no está disponible.");

        // RE-SCHEDULE LOGIC: Cancel any existing scheduled appointment for this phone
        console.log(`[Internal Calendar] Checking for existing appointments to re-schedule for ${phone}...`);
        await db.execute(
            'UPDATE appointments SET status = "cancelled" WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE()',
            [phone]
        );

        // CLEAR TEMPORARY LOCKS
        const cleanPhone = phone.replace(/\D/g, '');
        await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);

        // Insert into DB
        const [result] = await db.execute(
            'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled")',
            [name, phone, cedula, age, date, time, duration]
        );

        console.log('[Internal Calendar] Appointment booked with ID:', result.insertId);
        return {
            success: true,
            message: "Cita agendada correctamente.",
            id: result.insertId
        };
    } catch (error) {
        console.error('[Internal Calendar] Booking Error:', error.message);

        // RACE CONDITION HANDLING
        if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate entry')) {
            return {
                success: false,
                message: "Lo siento, alguien acaba de reservar ese horario hace un segundo. Por favor elige otro.",
                error: "Duplicate slot detected"
            };
        }

        return {
            success: false,
            message: "No se pudo agendar la cita.",
            error: error.message
        };
    }
}

/**
 * Temporarily lock a slot for a user.
 */
export async function lockSlot(phone, date, time) {
    const cleanPhone = phone.replace(/\D/g, '');
    try {
        // Delete old locks for this phone
        await db.execute('DELETE FROM chatbot_locked_slots WHERE locked_by = ?', [cleanPhone]);

        // Insert new lock
        await db.execute(
            'INSERT INTO chatbot_locked_slots (date, time, locked_by) VALUES (?, ?, ?)',
            [date, time, cleanPhone]
        );
        console.log(`[Calendar] Slot ${date} ${time} LOCKED for ${cleanPhone}`);
        return true;
    } catch (error) {
        console.error('[Calendar] Lock Error:', error);
        return false;
    }
}
