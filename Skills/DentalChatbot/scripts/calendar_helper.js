/**
 * Helper script for Google Calendar API integration.
 * This script is configured for the Hexadent project.
 */

const { google } = require('googleapis');

// Google Calendar API Key from environment variables
const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;

const calendar = google.calendar({ version: 'v3', auth: API_KEY });

/**
 * Checks if a specific date and time is available.
 * @param {string} calendarId - The email of the calendar owner (e.g., your gmail).
 * @param {string} date - Date in YYYY-MM-DD format.
 * @param {string} time - Time in HH:MM format.
 * @returns {Promise<boolean>}
 */
async function checkAvailability(calendarId, date, time) {
    const start = `${date}T${time}:00Z`;
    const end = `${date}T${time}:30:00Z`;

    try {
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: start,
            timeMax: end,
            singleEvents: true,
        });

        return response.data.items.length === 0;
    } catch (error) {
        console.error("Calendar API Error:", error.message);
        return false;
    }
}

/**
 * Template for booking an appointment (Requires OAuth2 for non-public calendars).
 * NOTE: Booking usually requires a Service Account or OAuth2 token.
 */
async function bookAppointment(calendarId, patientData) {
    console.log(`Booking request for ${patientData.name} on ${patientData.date} at ${patientData.time}`);
    // This part requires OAuth2 to actually write to the calendar.
}

module.exports = { checkAvailability, bookAppointment };
