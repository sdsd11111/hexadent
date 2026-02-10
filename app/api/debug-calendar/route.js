
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'cristhopheryeah113@gmail.com';
        const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

        if (!SERVICE_ACCOUNT) {
            return NextResponse.json({ error: "Missing GOOGLE_SERVICE_ACCOUNT_KEY" }, { status: 500 });
        }

        const credentials = JSON.parse(SERVICE_ACCOUNT);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });

        const calendar = google.calendar('v3');
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + 45); // Wipe next 45 days

        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: now.toISOString(),
            timeMax: future.toISOString(),
            singleEvents: true,
        });

        const events = response.data.items || [];
        let deletedCount = 0;

        for (const event of events) {
            try {
                await calendar.events.delete({
                    auth: auth,
                    calendarId: CALENDAR_ID,
                    eventId: event.id,
                });
                deletedCount++;
            } catch (e) {
                console.error(`Error deleting event ${event.id}:`, e.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: `SISTEMA REINICIADO. Se borraron ${deletedCount} citas del calendario para los próximos 45 días.`,
            range: { from: now.toISOString(), to: future.toISOString() }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
