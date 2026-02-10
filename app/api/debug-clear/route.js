
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
        const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

        if (!SERVICE_ACCOUNT || !CALENDAR_ID) {
            return NextResponse.json({ error: "Missing env vars" });
        }

        const credentials = JSON.parse(SERVICE_ACCOUNT);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });

        const calendar = google.calendar('v3');
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1); // Mañana
        const dateStr = targetDate.toISOString().split('T')[0];

        // Force to start of day in ECU time
        const startDay = new Date(`${dateStr}T00:00:00-05:00`);
        const limitDate = new Date(`${dateStr}T23:59:59-05:00`);

        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDay.toISOString(),
            timeMax: limitDate.toISOString(),
            singleEvents: true,
        });

        const events = response.data.items || [];
        let deletedEvents = [];

        for (const event of events) {
            if (event.summary && (event.summary.includes("Cristhopher Reyes") || event.summary.includes("Cita:"))) {
                await calendar.events.delete({
                    auth: auth,
                    calendarId: CALENDAR_ID,
                    eventId: event.id
                });
                deletedEvents.push(event.summary);
            }
        }

        return NextResponse.json({
            status: "SUCCESS",
            message: `Deleted ${deletedEvents.length} events for ${dateStr}`,
            deleted_events: deletedEvents
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
