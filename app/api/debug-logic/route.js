import { NextResponse } from 'next/server';
import { getAvailableSlots } from '../../../lib/chatbot/scripts/calendar_helper';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const debugMsg = searchParams.get('msg') || "Hola quiero cita mañana a las 10am";
        const showLogs = searchParams.get('logs');

        if (showLogs) {
            const connection = await mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                port: parseInt(process.env.MYSQL_PORT)
            });

            const [rows] = await connection.execute('SELECT * FROM chatbot_logs ORDER BY id DESC LIMIT 5');
            await connection.end();

            return NextResponse.json({
                recent_logs: rows.map(r => ({
                    timestamp: r.timestamp,
                    user_msg: r.user_msg,
                    bot_resp: r.bot_resp,
                    // We need to see if we stored the prompt or context. 
                    // Usually we don't store the full prompt in logs, just msg/resp.
                    // But we can infer from the response.
                }))
            });
        }

        // --- REPLICATE LOGIC.JS (Condensed) ---
        const now = new Date();
        const ecuadorTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
        const dateStr = ecuadorTime.toISOString().split('T')[0];

        const resolveDate = (text) => {
            const lowText = text.toLowerCase();
            const anchor = new Date(now.getTime() - (5 * 60 * 60 * 1000));
            // Force midnight
            const date = new Date(Date.UTC(anchor.getFullYear(), anchor.getMonth(), anchor.getDate()));

            if (lowText.includes('mañana')) date.setDate(date.getDate() + 1);

            return date.toISOString().split('T')[0];
        };

        const targetDate = resolveDate(debugMsg);

        // Duration Logic (Condensed)
        let duration = 20;

        const slots = await getAvailableSlots(targetDate, duration);
        const slotsDisplay = slots.length > 0 ? slots.join(', ') : '(Empty)';

        // Time logic check
        const requestedTimeMatch = debugMsg.match(/(\d{1,2})(?::(\d{2}))?\s*(pm|am|p\.m|a\.m)?/i);
        let timeCheckLog = "No time detected";

        if (requestedTimeMatch) {
            let hour = parseInt(requestedTimeMatch[1]);
            const pm = requestedTimeMatch[3]?.toLowerCase().includes('p');
            if (pm && hour < 12) hour += 12;
            if (!pm && hour === 12) hour = 0;

            // Replicate the "Past Time" check from logic.js
            let isPast = false;
            let comparisonLog = "";

            if (targetDate === dateStr) {
                const nowEcu = new Date(now.getTime() - (5 * 60 * 60 * 1000));
                const currentHour = nowEcu.getUTCHours();
                const currentMin = nowEcu.getUTCMinutes();
                const currentTotal = currentHour + (currentMin / 60);
                const reqTotal = hour + (parseInt(requestedTimeMatch[2] || "0") / 60);

                comparisonLog = `Is Today. Req=${reqTotal.toFixed(2)} vs Curr=${currentTotal.toFixed(2)}`;
                if (reqTotal < currentTotal) isPast = true;
            } else {
                comparisonLog = `Not Today. Target=${targetDate} vs Today=${dateStr}`;
            }

            timeCheckLog = `Parsed Hour: ${hour}. ${comparisonLog}. IsPast=${isPast}`;
        }

        return NextResponse.json({
            simulated_msg: debugMsg,
            server_now_utc: now.toISOString(),
            ecuador_calculated: dateStr,
            resolved_target_date: targetDate,
            slots_found_count: slots.length,
            slots_preview: slots,
            logic_check: timeCheckLog,
            env_calendar_id: process.env.GOOGLE_CALENDAR_ID ? "DEFINED" : "MISSING"
        });

    } catch (error) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
