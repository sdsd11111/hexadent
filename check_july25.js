import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { default: db } = await import('./lib/db.js');

console.log("=== VERIFICANDO 25 DE JULIO 2026 ===\n");

// 1. Check what day of week it actually is
const july25 = new Date('2026-07-25T12:00:00-05:00');
const dayName = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(july25);
const dayOfWeek = july25.getDay(); // 0=Sunday, 6=Saturday

console.log(`📅 Día real: ${dayName.toUpperCase()} (${dayOfWeek})`);
console.log(`   ${dayOfWeek === 0 ? '⚠️  ES DOMINGO (cerrado)' : dayOfWeek === 6 ? '⚠️  ES SÁBADO (horario especial)' : '✅ Es día de semana'}`);

// 2. Check if blocked in database
console.log(`\n🔍 Revisando base de datos...`);
const [isBlocked] = await db.execute('SELECT * FROM blocked_dates WHERE blocked_date = ?', ['2026-07-25']);

if (isBlocked.length > 0) {
    console.log(`🔴 SÍ está bloqueado en BD`);
    console.log(`   Razón: "${isBlocked[0].reason}"`);
} else {
    console.log(`✅ NO está bloqueado en BD`);
}

// 3. Show all blocked dates in July
console.log(`\n📋 Fechas bloqueadas en julio 2026:`);
const [julyBlocks] = await db.execute(
    'SELECT blocked_date, reason FROM blocked_dates WHERE blocked_date >= ? AND blocked_date < ? ORDER BY blocked_date',
    ['2026-07-01', '2026-08-01']
);

if (julyBlocks.length > 0) {
    julyBlocks.forEach(b => {
        const date = b.blocked_date.toISOString().split('T')[0];
        console.log(`   - ${date}: ${b.reason}`);
    });
} else {
    console.log(`   (ninguna)`);
}

console.log(`\n=== CONCLUSIÓN ===`);
if (dayOfWeek === 0 && isBlocked.length === 0) {
    console.log(`El bot debería decir: "El 25 de julio es domingo y la clínica está cerrada."`);
} else if (dayOfWeek === 0 && isBlocked.length > 0) {
    console.log(`El bot debería decir: "El 25 de julio está cerrado (domingo + bloqueado)."`);
} else if (isBlocked.length > 0) {
    console.log(`El bot debería decir: "El 25 de julio está cerrado por: ${isBlocked[0].reason}"`);
} else {
    console.log(`El 25 de julio DEBERÍA estar disponible (es ${dayName} y no está bloqueado).`);
}

process.exit(0);
