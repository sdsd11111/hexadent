require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

// MOCKING THE PRODUCTION ENVIRONMENT
// This script simulates exactly what happens in Vercel to find the "0 slots" bug

// 1. Manually load environment variables if dotenv fails (mimic Vercel)
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'cristhopheryeah113@gmail.com';
const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY;

console.log("=== DIAGNÓSTICO DE CALENDARIO ===");
console.log("1. CALENDAR_ID:", CALENDAR_ID ? "DEFINIDO ✅" : "FALTA ❌");
console.log("2. API_KEY:", API_KEY ? "DEFINIDO ✅" : "FALTA ❌");
console.log("3. SERVICE_ACCOUNT_KEY:", process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? "DEFINIDO ✅" : "FALTA ❌");

async function checkSlots() {
    try {
        // --- AUTH SETUP (Copied from calendar_helper.js) ---
        let auth;
        try {
            const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
            if (serviceAccountKey) {
                const credentials = JSON.parse(serviceAccountKey);
                auth = new google.auth.GoogleAuth({
                    credentials,
                    scopes: ['https://www.googleapis.com/auth/calendar'],
                });
                console.log("4. AUTH: Service Account cargada desde ENV ✅");
            } else {
                console.log("4. AUTH: Usando keyFile local (Fallback) ⚠️");
                const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'lib', 'chatbot', 'resources', 'service-account.json');
                auth = new google.auth.GoogleAuth({
                    keyFile: SERVICE_ACCOUNT_PATH,
                    scopes: ['https://www.googleapis.com/auth/calendar'],
                });
            }
        } catch (error) {
            console.error("❌ ERROR EN AUTH:", error.message);
            return;
        }

        const calendar = google.calendar('v3');

        // --- SIMULATE "MAÑANA" REQUEST ---
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1); // Mañana
        const dateStr = targetDate.toISOString().split('T')[0];

        // Force Monday if it's Sunday (just for testing slots)
        if (targetDate.getDay() === 0) {
            targetDate.setDate(targetDate.getDate() + 1);
        }

        const dayOfWeek = targetDate.getDay();
        const startDay = new Date(`${dateStr}T09:00:00-05:00`);
        const limitDate = new Date(`${dateStr}T18:00:00-05:00`);

        console.log(`\n5. CONSULTANDO: ${dateStr} (${dayOfWeek})`);
        console.log(`   Desde: ${startDay.toISOString()}`);
        console.log(`   Hasta: ${limitDate.toISOString()}`);

        const response = await calendar.events.list({
            auth: auth,
            calendarId: CALENDAR_ID,
            timeMin: startDay.toISOString(),
            timeMax: limitDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];
        console.log(`\n6. EVENTOS ENCONTRADOS: ${events.length}`);

        if (events.length > 0) {
            console.log("   Eventos (Busy Slots):");
            events.forEach(e => console.log(`   - ${e.summary}: ${e.start.dateTime} -> ${e.end.dateTime}`));
        } else {
            console.log("   (No hay eventos, el día está libre)");
        }

        // --- SIMULATE SLOT GENERATION ---
        console.log("\n7. GENERANDO SLOTS (Logica de calendar_helper.js)...");
        const busySlots = events.map(e => ({
            start: new Date(e.start.dateTime || e.start.date),
            end: new Date(e.end.dateTime || e.end.date)
        }));

        let available = [];
        let current = new Date(startDay);
        const durationMin = 20;
        const requestedDurationMs = durationMin * 60 * 1000;
        const incrementMs = 15 * 60 * 1000;

        let lunchStart = 13;
        let lunchEnd = 15;

        let iterations = 0;
        while (current.getTime() + requestedDurationMs <= limitDate.getTime() && iterations < 100) {
            iterations++;
            const next = new Date(current.getTime() + requestedDurationMs);

            // Decimal hour calculation relative to the day's start
            const dayStartForHour = new Date(`${dateStr}T00:00:00-05:00`).getTime();
            const elapsedMs = current.getTime() - dayStartForHour;
            const decimalHour = elapsedMs / (60 * 60 * 1000);

            let inLunch = false;
            const endDecimalHour = (current.getTime() + requestedDurationMs - dayStartForHour) / (1000 * 60 * 60);
            if (decimalHour < lunchEnd && endDecimalHour > lunchStart) {
                inLunch = true;
            }

            if (inLunch) {
                current = new Date(current.getTime() + incrementMs);
                continue;
            }

            const isBusy = busySlots.some(busy => (current < busy.end && next > busy.start));

            if (!isBusy) {
                const timeString = current.toLocaleTimeString('es-EC', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'America/Guayaquil'
                });
                available.push(timeString);
            }
            current = new Date(current.getTime() + incrementMs);
        }

        console.log(`\n=== RESULTADO FINAL ===`);
        console.log(`Total Slots Generados: ${available.length}`);
        console.log(`Slots: ${available.join(', ')}`);

    } catch (e) {
        console.error("\n❌ ERROR CRÍTICO:", e.message);
        if (e.response) {
            console.error("   Detalle API:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

checkSlots();
