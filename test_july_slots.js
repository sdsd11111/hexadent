import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

console.log("=== TESTING getAvailableSlots FOR JULY 25 ===\n");

const testDate = '2026-07-25';
const duration = 20;

console.log(`Fecha: ${testDate}`);
console.log(`Duración: ${duration} min\n`);

try {
    const slots = await getAvailableSlots(testDate, duration);
    console.log(`✅ Función ejecutada exitosamente`);
    console.log(`📊 Slots retornados: ${slots.length}`);

    if (slots.length > 0) {
        console.log(`\nHorarios disponibles:`);
        console.log(slots.join(', '));
    } else {
        console.log(`\n❌ La función retornó array vacío []`);
        console.log(`\nEsto hace que el bot invente razones como:`);
        console.log(`  - "Es domingo" (mentira)`);
        console.log(`  - "Está bloqueado" (mentira)`);
    }
} catch (error) {
    console.error(`❌ ERROR al ejecutar getAvailableSlots:`);
    console.error(error);
}

process.exit(0);
