import { google } from 'googleapis';

const calendar = google.calendar('v3');
const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

/**
 * Get all available 1-hour slots for a specific day.
 * Assumes working hours 09:00 - 18:00 (UTC-5)
 */
export async function getAvailableSlots(dateStr) {
    try {
        // Date range in UTC-5 (Guayaquil)
        // dateStr format: YYYY-MM-DD
        const startDay = new Date(`${dateStr}T09:00:00-05:00`);
        const endDay = new Date(`${dateStr}T18:00:00-05:00`);

        const response = await calendar.events.list({
            key: API_KEY,
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

        // Generate 1-hour slots
        let available = [];
        let current = new Date(startDay);

        while (current < endDay) {
            let next = new Date(current.getTime() + 60 * 60 * 1000);

            // Check if this slot overlaps with any busy slot
            const isBusy = busySlots.some(busy => {
                return (current < busy.end && next > busy.start);
            });

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
            key: API_KEY,
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
 * Log and potentially book an appointment.
 */
export async function bookAppointment(details) {
    console.log('Solicitud de agendamiento recibida:', details);
    return { success: true, message: "Appointment request logged." };
}
