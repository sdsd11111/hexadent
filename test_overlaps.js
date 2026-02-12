
const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

async function test() {
    console.log("=== TESTING SLOT OVERLAP (WEEKDAY) ===\n");
    const monday = '2026-07-20';

    const durations = [20, 45, 60];
    const labels = ["General", "Ortodoncia", "Niños"];

    for (let i = 0; i < durations.length; i++) {
        const d = durations[i];
        const label = labels[i];
        console.log(`\n--- Treatment: ${label} (${d} min) ---`);
        const slots = await getAvailableSlots(monday, d);

        const lunchCritical = slots.filter(s => s >= '12:00' && s <= '13:00');
        const closingCritical = slots.filter(s => s >= '17:00' && s <= '18:00');

        console.log(`Slots near lunch (13:00): ${lunchCritical.join(', ') || 'NADA'}`);
        console.log(`Slots near closing (18:00): ${closingCritical.join(', ') || 'NADA'}`);
    }
}

test().then(() => process.exit(0));
