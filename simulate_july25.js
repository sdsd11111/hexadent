import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

// Simulate what the bot SHOULD be seeing for "quiero agendar para el 25 de julio"

const { resolveDate } = await import('./lib/chatbot/utils/date_helper.js');
const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');
const { default: db } = await import('./lib/db.js');

const now = new Date('2026-02-12T11:33:00-05:00'); // When the user sent the message
const userMsg = "HOLA QUIERO AGENDAR PARA ESTE 25 DE JULIO";

console.log("=== SIM ULATING BOT LOGIC ===\n");
console.log(`User message: "${userMsg}"`);
console.log(`Current time: ${now.toISOString()}\n`);

// 1. Resolve the date
const anchorForResolve = new Date(now.getTime() - (5 * 60 * 60 * 1000));
const targetDate = resolveDate(userMsg, anchorForResolve);
console.log(`✅ Resolved date: ${targetDate}`);

// 2. Get available slots
const duration = 20; // Default
const slots = await getAvailableSlots(targetDate, duration);
console.log(`✅ Available slots: ${slots.length} horarios`);
if (slots.length > 0) {
    console.log(`   ${slots.slice(0, 5).join(', ')}...`);
}

// 3. Check if blocked
const [isBlocked] = await db.execute('SELECT reason FROM blocked_dates WHERE blocked_date = ?', [targetDate]);
console.log(`✅ Blocked check: ${isBlocked.length > 0 ? `BLOQUEADO (${isBlocked[0].reason})` : 'NO bloqueado'}`);

// 4. Check day of week
const dayOfWeek = new Date(`${targetDate}T12:00:00-05:00`).getDay();
const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek];
console.log(`✅ Day of week: ${dayName} (${dayOfWeek})`);

console.log(`\n=== EXPECTED BOT BEHAVIOR ===`);
if (isBlocked.length > 0) {
    console.log(`❌ Debería decir: "El 25 de julio está cerrado: ${isBlocked[0].reason}"`);
} else if (dayOfWeek === 0) {
    console.log(`❌ Debería decir: "El 25 de julio es domingo y estamos cerrados."`);
} else if (slots.length > 0) {
    console.log(`✅ Debería decir: "Tenemos ${slots.length} horarios disponibles para el sábado 25 de julio..."`);
} else {
    console.log(`❌ Debería decir: "No hay horarios disponibles para el 25 de julio."`);
}

process.exit(0);
