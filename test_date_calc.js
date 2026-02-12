// Test date calculation issue
const dateStr = '2026-07-25';

console.log("=== TESTING DATE INTERPRETATION ===\n");

console.log("MÉTODO ACTUAL (UTC):");
const dateObjUTC = new Date(`${dateStr}T12:00:00Z`);
const dayOfWeekUTC = dateObjUTC.getUTCDay();
console.log(`  Date object: ${dateObjUTC}`);
console.log(`  getUTCDay(): ${dayOfWeekUTC} (${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeekUTC]})`);

console.log("\nMÉTODO CORRECTO (Ecuador -05:00):");
const dateObjEcu = new Date(`${dateStr}T12:00:00-05:00`);
const dayOfWeekEcu = dateObjEcu.getDay();
console.log(`  Date object: ${dateObjEcu}`);
console.log(`  getDay(): ${dayOfWeekEcu} (${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayOfWeekEcu]})`);

console.log("\nMÉTODO INTL (Ecuador):");
const dayNameIntl = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' }).format(new Date(`${dateStr}T12:00:00-05:00`));
console.log(`  Nombre: ${dayNameIntl}`);

console.log("\n=== RESULTADO ===");
console.log(`El método actual dice: ${dayOfWeekUTC === 0 ? 'DOMINGO (CERRADO)' : dayOfWeekUTC === 6 ? 'SÁBADO' : 'Día de semana'}`);
console.log(`El método correcto dice: ${dayOfWeekEcu === 0 ? 'DOMINGO (CERRADO)' : dayOfWeekEcu === 6 ? 'SÁBADO' : 'Día de semana'}`);
console.log(`\n${dayOfWeekUTC !== dayOfWeekEcu ? '❌ HAY DESF ASE! El bot está calculando mal el día.' : '✅ Coinciden'}`);
