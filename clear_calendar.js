require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// AUTH SETUP
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
        const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'service-account.json');
        auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_PATH,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
    }
} catch (error) {
    console.error("Auth Error:", error.message);
}

async function clearTomorrow() {
    const calendar = google.calendar('v3');
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1); // Mañana
    const dateStr = targetDate.toISOString().split('T')[0];

    const startDay = new Date(`${dateStr}T00:00:00-05:00`);
    const limitDate = new Date(`${dateStr}T23:59:59-05:00`);

    console.log(`Buscando eventos para borrar en: ${dateStr}`);

    const response = await calendar.events.list({
        auth: auth,
        calendarId: CALENDAR_ID,
        timeMin: startDay.toISOString(),
        timeMax: limitDate.toISOString(),
        singleEvents: true,
    });

    const events = response.data.items || [];
    console.log(`Encontrados ${events.length} eventos.`);

    for (const event of events) {
        if (event.summary && event.summary.includes("Cristhopher Reyes")) {
            console.log(`Borrando evento: ${event.summary} (${event.id})`);
            await calendar.events.delete({
                auth: auth,
                calendarId: CALENDAR_ID,
                eventId: event.id
            });
        }
    }
    console.log("Limpieza completada.");
}

clearTomorrow();
