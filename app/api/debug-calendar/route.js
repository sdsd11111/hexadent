
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
        const SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

        const debugInfo = {
            env: {
                CALENDAR_ID_EXISTS: !!CALENDAR_ID,
                CALENDAR_ID_VALUE_MASKED: CALENDAR_ID ? CALENDAR_ID.substring(0, 5) + '...' : 'NULL',
                SERVICE_ACCOUNT_EXISTS: !!SERVICE_ACCOUNT,
            },
            auth_attempt: null,
            calendar_list_attempt: null
        };

        // 1. Auth
        let auth;
        try {
            if (SERVICE_ACCOUNT) {
                const credentials = JSON.parse(SERVICE_ACCOUNT);
                auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/calendar'],
                });
                debugInfo.auth_attempt = "SUCCESS (Service Account)";
            } else {
                throw new Error("No Service Account Key found");
            }
        } catch (e) {
            debugInfo.auth_attempt = `FAILED: ${e.message}`;
            return NextResponse.json(debugInfo, { status: 500 });
        }

        // 2. Calendar List
        try {
            const calendar = google.calendar('v3');

            // TARGET DATE: Miércoles 11 de Febrero (Mañana real)
            const targetDate = new Date('2026-02-11T09:00:00-05:00');
            const endDate = new Date('2026-02-11T18:00:00-05:00');

            debugInfo.target_date_check = targetDate.toISOString();

            const response = await calendar.events.list({
                auth: auth,
                calendarId: CALENDAR_ID,
                timeMin: targetDate.toISOString(),
                timeMax: endDate.toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });

            debugInfo.calendar_list_attempt = {
                status: "SUCCESS",
                items_found: response.data.items ? response.data.items.length : 0,
                events: response.data.items.map(i => ({
                    summary: i.summary,
                    start: i.start.dateTime || i.start.date,
                    end: i.end.dateTime || i.end.date
                }))
            };

        } catch (e) {
            debugInfo.calendar_list_attempt = `FAILED: ${e.message}`;
            if (e.response) {
                debugInfo.api_error_details = e.response.data;
            }
        }

        return NextResponse.json(debugInfo);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
