
const { google } = require('googleapis');

// Mock env vars from .env for the script
const CALENDAR_ID = 'cristhopheryeah113@gmail.com';
const SERVICE_ACCOUNT_KEY = '{"type": "service_account", "project_id": "hexadent-123", ...}'; // Needs real value

async function test() {
    try {
        console.log("Testing Calendar Insertion...");
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });

        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: 'TEST CITA: AGENT DIAGNOSTIC',
            start: { dateTime: '2026-02-11T16:00:00-05:00', timeZone: 'America/Guayaquil' },
            end: { dateTime: '2026-02-11T16:30:00-05:00', timeZone: 'America/Guayaquil' },
        };

        const response = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            requestBody: event,
        });

        console.log("SUCCESS! Event created:", response.data.htmlLink);
    } catch (err) {
        console.error("FAILED!");
        console.error("Error Message:", err.message);
        if (err.response) {
            console.error("Response Data:", JSON.stringify(err.response.data, null, 2));
        }
    }
}

test();
