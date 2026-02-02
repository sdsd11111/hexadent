import { google } from 'googleapis';
import path from 'path';

const calendar = google.calendar('v3');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'service-account.json');

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/calendar'],
});

/**
 * Get all available 1-hour slots for a specific day.
 * Assumes working hours 09:00 - 18:00 (UTC-5)
 */
export async function getAvailableSlots(dateStr) {
    try {
        const startDay = new Date(`${dateStr}T09:00:00-05:00`);
        const endDay = new Date(`${dateStr}T19:00:00-05:00`);

        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDay.toISOString(),
            timeMax: endDay.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];
        const busySlots = events.map(e => ({
            start: new Date(e.start.dateTime || e.start.date),
            end: new Date(e.end.dateTime || e.end.date)
        }));

        const available = [];
        let current = new Date(startDay);

        while (current < endDay) {
            const next = new Date(current.getTime() + 60 * 60 * 1000);
            const hour = current.getHours();

            // Skip lunch break (13:00 - 15:00)
            if (hour >= 13 && hour < 15) {
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
        // NOTE: Writing to Google Calendar usually requires OAuth2 or Service Account.
        // Using only an API Key might fail with 401/403.
        const event = {
            summary: `Cita: ${name} (${cedula})`,
            description: `Paciente: ${name}\nTeléfono: ${phone}\nCédula: ${cedula}`,
            start: {
                dateTime: `${date}T${time}:00-05:00`,
                timeZone: 'America/Guayaquil',
            },
            end: {
                dateTime: new Date(new Date(`${date}T${time}:00-05:00`).getTime() + 60 * 60 * 1000).toISOString(),
                timeZone: 'America/Guayaquil',
            },
        };

        const response = await calendar.events.insert({
            auth: auth,
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        console.log('[Calendar] Appointment booked successfully. Link:', response.data.htmlLink);
        return { success: true, message: "Cita agendada correctamente.", link: response.data.htmlLink };
    } catch (error) {
        console.error('[Calendar] Booking Error:', error.response?.data || error.message);
        return {
            success: false,
            message: "No pude grabar en el calendario. Por favor verifica los permisos.",
            error: error.message
        };
    }
}
