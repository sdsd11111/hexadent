
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

        // 1. Auth check
        let auth;
        if (SERVICE_ACCOUNT) {
            try {
                const credentials = JSON.parse(SERVICE_ACCOUNT);
                auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/calendar'],
                });
                debugInfo.auth_attempt = "SUCCESS (Service Account)";
            } catch (e) {
                debugInfo.auth_attempt = `FAILED PARSE: ${e.message}`;
                return NextResponse.json(debugInfo, { status: 500 });
            }
        } else {
            debugInfo.auth_attempt = "FAILED: No Service Account Key";
            return NextResponse.json(debugInfo, { status: 500 });
        }

        // 2. Calendar List & Simulation
        try {
            const calendar = google.calendar('v3');

            // TARGET DATE: Miércoles 11 de Febrero (Mañana real)
            const targetDate = new Date('2026-02-11T09:00:00-05:00');
            const endDate = new Date('2026-02-11T18:00:00-05:00');
            const dateStr = targetDate.toISOString().split('T')[0];

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

            const busySlots = (response.data.items || []).map(e => ({
                start: new Date(e.start.dateTime || e.start.date),
                end: new Date(e.end.dateTime || e.end.date)
            }));

            // --- SIMULATION LOGIC ---
            const available = [];
            const logs = [];
            const dayOfWeek = targetDate.getDay();

            // Define Hours (Logic from Helper)
            let startHour, endHour, lunchStart, lunchEnd;
            if (dayOfWeek === 6) {
                startHour = 8.5; endHour = 15; lunchStart = null; lunchEnd = null;
            } else {
                startHour = 9; endHour = 18; lunchStart = 13; lunchEnd = 15;
            }

            const startDay = new Date(`${dateStr}T${dayOfWeek === 6 ? '08:30' : '09:00'}:00-05:00`);
            const limitDate = new Date(`${dateStr}T${dayOfWeek === 6 ? '15:00' : '18:00'}:00-05:00`);

            logs.push(`Config: Day=${dayOfWeek}, Start=${startDay.toISOString()}, End=${limitDate.toISOString()}`);

            let current = new Date(startDay);
            const durationMin = 20;
            const requestedDurationMs = durationMin * 60 * 1000;
            const incrementMs = 15 * 60 * 1000;

            let iterations = 0;
            while (current.getTime() + requestedDurationMs <= limitDate.getTime() && iterations < 50) {
                iterations++;
                const next = new Date(current.getTime() + requestedDurationMs);

                // Decimal calculation
                const dayStartForHour = new Date(`${dateStr}T00:00:00-05:00`).getTime();
                const elapsedMs = current.getTime() - dayStartForHour;
                const decimalHour = elapsedMs / (60 * 60 * 1000);

                // Lunch check
                let inLunch = false;
                const endDecimalHour = (current.getTime() + requestedDurationMs - dayStartForHour) / (1000 * 60 * 60);

                if (lunchStart && decimalHour < lunchEnd && endDecimalHour > lunchStart) {
                    inLunch = true;
                }

                // Busy check
                const isBusy = busySlots.some(busy => (current < busy.end && next > busy.start));

                const timeStr = current.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Guayaquil' });

                let status = "OK";
                if (inLunch) status = "LUNCH";
                if (isBusy) status = "BUSY";

                logs.push(`Slot ${timeStr}: Decimal=${decimalHour.toFixed(2)} -> ${status}`);

                if (!inLunch && !isBusy) {
                    available.push(timeStr);
                }

                if (inLunch) {
                    // Skip logic simulation
                }
                // Always increment
                current = new Date(current.getTime() + incrementMs);
            }

            // Return success with simulation data
            return NextResponse.json({
                target_date: dateStr,
                events_found: busySlots.length,
                generated_slots: available,
                slot_logs: logs,
                events: response.data.items ? response.data.items.map(i => ({
                    summary: i.summary,
                    start: i.start.dateTime || i.start.date,
                    end: i.end.dateTime || i.end.date
                })) : []
            });

        } catch (e) {
            debugInfo.calendar_list_attempt = `FAILED: ${e.message}`;
            if (e.response) {
                debugInfo.api_error_details = e.response.data;
            }
            return NextResponse.json(debugInfo, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
