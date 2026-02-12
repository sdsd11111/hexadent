import { resolveDate, getDateTruth } from './lib/chatbot/utils/date_helper.js';

const now = new Date("2026-02-12T09:00:00-05:00"); // Mock "now" as Feb 12, 2026

async function testDates() {
    console.log("--- DATE SOVEREIGNTY VERIFICATION ---");
    console.log(`Context: Now is ${now.toISOString().split('T')[0]} (Loja Time)\n`);

    const cases = [
        { input: "25 de marzo", expectedDay: "MIÉRCOLES", expectedYear: "2026" },
        { input: "25 de julio de 2027", expectedDay: "DOMINGO", expectedYear: "2027" },
        { input: "mañana", expectedDay: "VIERNES", expectedYear: "2026" },
        { input: "próximo lunes", expectedDay: "LUNES", expectedYear: "2026" }
    ];

    for (const c of cases) {
        const resolved = resolveDate(c.input, now);
        const truth = getDateTruth(resolved, now);

        const dateObj = new Date(`${resolved}T12:00:00-05:00`);
        const dayName = new Intl.DateTimeFormat('es-EC', { weekday: 'long' }).format(dateObj).toUpperCase();

        console.log(`Input: "${c.input}"`);
        console.log(`Resolved: ${resolved} (${dayName})`);
        console.log(`Truth Block: ${truth}`);

        const success = dayName === c.expectedDay && resolved.startsWith(c.expectedYear);
        if (success) {
            console.log("✅ PASS\n");
        } else {
            console.log(`❌ FAIL (Expected ${c.expectedDay} ${c.expectedYear})\n`);
        }
    }
}

testDates().catch(console.error);
