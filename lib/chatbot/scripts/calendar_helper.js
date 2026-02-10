import db from '../../db.js';

/**
 * Get all available slots for a specific day.
 * Assumes working hours 09:00 - 13:00 and 15:00 - 18:00 (UTC-5)
 * Saturdays 08:30 - 15:00
 */
export async function getAvailableSlots(dateStr, durationMin = 20) {
    try {
        const date = new Date(`${dateStr}T00:00:00-05:00`);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // 1. Check for Sunday (Closed)
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
        const [appointments] = await db.execute(
            'SELECT appointment_time, duration_minutes FROM appointments WHERE appointment_date = ? AND status != "cancelled"',
            [dateStr]
        );

        const busySlots = appointments.map(a => {
            const start = new Date(`${dateStr}T${a.appointment_time}-05:00`);
            const end = new Date(start.getTime() + a.duration_minutes * 60 * 1000);
            return { start, end };
        });

        const available = [];
        let current = new Date(startDay.getTime());
        const incrementMs = 15 * 60 * 1000;
        const requestedDurationMs = durationMin * 60 * 1000;

        const nowEcu = new Date(new Date().getTime() - (5 * 60 * 60 * 1000));
        const isToday = dateStr === nowEcu.toISOString().split('T')[0];

        while (current.getTime() + requestedDurationMs <= limitDate.getTime()) {
            // Skip past slots if today
            if (isToday && current < nowEcu) {
                current = new Date(current.getTime() + incrementMs);
                continue;
            }
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
                current = new Date(current.getTime() + incrementMs);
                continue;
            }

            const isBusy = busySlots.some(busy => (current < busy.end && next > busy.start));

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
        return {
            success: false,
            message: "No se pudo agendar la cita.",
            error: error.message
        };
    }
}

