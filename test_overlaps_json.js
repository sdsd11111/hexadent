
import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
            process.env[key.trim()] = value;
        }
    });
}

const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

async function test() {
    const monday = '2026-07-20';
    const results = {};
    for (const d of [20, 45, 60]) {
        const slots = await getAvailableSlots(monday, d);
        results[`DUR_${d}`] = slots.filter(s => s >= '12:00' && s <= '13:00').join(',');
    }
    console.log("JSON_RESULTS:" + JSON.stringify(results));
}

test().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
