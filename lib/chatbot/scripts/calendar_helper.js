import { google } from 'googleapis';

const calendar = google.calendar('v3');
const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

/**
 * Check if a date/time slot is available in Google Calendar.
 */
export async function checkAvailability(date, time) {
    try {
        const startDateTime = new Date(`${date}T${time}:00Z`); // UTC
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour later

        const response = await calendar.events.list({
            key: API_KEY,
            calendarId: CALENDAR_ID,
            timeMin: startDateTime.toISOString(),
            timeMax: endDateTime.toISOString(),
            singleEvents: true,
        });

        const events = response.data.items || [];
        return events.length === 0;
    } catch (error) {
        console.error('Calendar Availability Error:', error);
        return false;
    }
}

/**
 * Placeholder for booking an appointment.
 * Note: Requires OAuth2 or Service Account for writing to private calendars.
 */
export async function bookAppointment(details) {
    console.log('Solicitud de agendamiento recibida:', details);
    // Logic to save to local DB or send email/notification
    return { success: true, message: "Appointment request logged." };
}
