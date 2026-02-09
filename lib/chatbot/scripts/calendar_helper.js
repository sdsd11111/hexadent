import { google } from 'googleapis';
import path from 'path';

const calendar = google.calendar('v3');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
// Initialize Google Auth
let auth;
try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
        const credentials = JSON.parse(serviceAccountKey);
        auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
    } else {
        // Fallback for local development
        const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'service-account.json');
        auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_PATH,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
    }
} catch (error) {
    console.error("[Calendar Helper] Auth Initialization Error:", error.message);
}

/**
 * Get all available 1-hour slots for a specific day.
 * Assumes working hours 09:00 - 18:00 (UTC-5)
 */
export async function getAvailableSlots(dateStr) {
    try {
        const date = new Date(`${dateStr}T00:00:00-05:00`);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // 1. Check for Sunday (Closed)
        if (dayOfWeek === 0) {
            return [];
        }

        // 2. Define hours based on day
        let startHour, endHour, lunchStart, lunchEnd;

        if (dayOfWeek === 6) { // Saturday
            startHour = 9;
            endHour = 13.5; // 13:30
            lunchStart = null;
            lunchEnd = null;
        } else { // Monday to Friday
            startHour = 9;
            endHour = 18.5; // 18:30
            lunchStart = 13;
            lunchEnd = 15;
        }

        const startDay = new Date(`${dateStr}T09:00:00-05:00`);
        const limitDate = new Date(`${dateStr}T${dayOfWeek === 6 ? '13:30' : '18:30'}:00-05:00`);

        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDay.toISOString(),
            timeMax: limitDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];
        const busySlots = events.map(e => ({
            start: new Date(e.start.dateTime || e.start.date),
            end: new Date(e.end.dateTime || e.end.date)
        }));

        const available = [];
        let current = new Date(startDay.getTime());

        while (current < limitDate) {
            const next = new Date(current.getTime() + 60 * 60 * 1000);
            const hour = current.getHours();
            const minutes = current.getMinutes();
            const decimalHour = hour + (minutes / 60);

            // Skip lunch break for weekdays
            if (lunchStart && decimalHour >= lunchStart && decimalHour < lunchEnd) {
                current = next;
                continue;
            }

            const isBusy = busySlots.some(busy => (current < busy.end && next > busy.start));

            if (!isBusy) {
                available.push(current.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false }));
            }
            current = next;
        }

        return available;
    } catch (error) {
        console.error('Calendar Slots Error:', error);
        return [];
    }
}

/**
 * Check if a specific slot is available.
 */
export async function checkAvailability(date, time) {
    try {
        const startDateTime = new Date(`${date}T${time}:00-05:00`); // Guayaquil
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        const dateObj = new Date(`${date}T00:00:00-05:00`);
        const dayOfWeek = dateObj.getDay();

        // 1. Backend Guard: Protect weekends/hours
        if (dayOfWeek === 0) return false; // Closed Sunday
        if (dayOfWeek === 6 && time > "13:30") return false; // Saturday afternoon
        if (time < "09:00" || (time > "13:00" && time < "15:00") || time > "18:30") {
            if (dayOfWeek !== 6) return false;
        }

        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDateTime.toISOString(),
            timeMax: endDateTime.toISOString(),
            singleEvents: true,
        });

        return (response.data.items || []).length === 0;
    } catch (error) {
        console.error('Calendar Availability Error:', error);
        return false;
    }
}

/**
 * Log and actually book an appointment in Google Calendar.
 */
export async function bookAppointment(details) {
    const { name, phone, cedula, date, time } = details;
    console.log('[Calendar] Attempting to book appointment:', details);

    try {
        const dateObj = new Date(`${date}T00:00:00-05:00`);
        const dayOfWeek = dateObj.getDay();

        // 1. Backend Guard: Protect weekends/hours
        if (dayOfWeek === 0) throw new Error("La clínica está cerrada los domingos.");
        if (dayOfWeek === 6 && time > "13:30") throw new Error("Los sábados solo atendemos hasta las 13:30.");
        if (time < "09:00" || (time > "13:00" && time < "15:00") || time > "18:30") {
            if (dayOfWeek !== 6) throw new Error("Horario fuera de atención (09:00-13:00 o 15:00-18:30).");
        }

        const startDateTime = `${date}T${time}:00-05:00`;
        const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

        const event = {
            summary: `Cita: ${name} (${cedula})`,
            description: `Paciente: ${name}\nTeléfono: ${phone}\nCédula: ${cedula}`,
            start: {
                dateTime: startDateTime,
                timeZone: 'America/Guayaquil',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'America/Guayaquil',
            },
        };

        console.log('[Calendar] Inserting event:', JSON.stringify(event, null, 2));

        const response = await calendar.events.insert({
            auth: auth,
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        console.log('[Calendar] Appointment booked successfully. ID:', response.data.id);
        console.log('[Calendar] HTML Link:', response.data.htmlLink);
        return { success: true, message: "Cita agendada correctamente.", link: response.data.htmlLink };
    } catch (error) {
        console.error('[Calendar] Booking Error Response:', JSON.stringify(error.response?.data || error.message, null, 2));
        return {
            success: false,
            message: "No pude grabar en el calendario. Por favor verifica los permisos.",
            error: error.message
        };
    }
}
