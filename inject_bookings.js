const fs = require('fs');
const mysql = require('mysql2/promise');

function loadEnv() {
    if (fs.existsSync('.env')) {
        const lines = fs.readFileSync('.env', 'utf8').split('\n');
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '').replace(/[\r\n]/g, '');
                if (k && !k.startsWith('#')) {
                    process.env[k] = v;
                }
            }
        });
    }
}

async function run() {
    loadEnv();
    const { bookAppointment } = await import('./lib/chatbot/scripts/calendar_helper.js');

    const dt = new Date();
    dt.setDate(dt.getDate() + 1); // Tomorrow
    const dateStr = dt.toISOString().split('T')[0];

    const patients = [
        { name: "Luis Felipe", phone: "593991112222", cedula: "1709876543", date: dateStr, time: "10:15", duration: 30, motive: "Revisión general" },
        { name: "Ana Gomez", phone: "593993334444", cedula: "1722334455", date: dateStr, time: "14:30", duration: 45, motive: "Blanqueamiento" },
        { name: "Mario Vargas (Hijo)", phone: "593995556666", cedula: "MENOR", age: 10, date: dateStr, time: "09:00", duration: 20, motive: "Odontopediatría" }
    ];

    console.log(`>>> [DB INJECTION] Creando reservas para la fecha: ${dateStr}`);
    
    for (const p of patients) {
        try {
            const res = await bookAppointment(p, false); // isAdmin = false to simulate bot booking
            console.log(`✅ Reserva inyectada para ${p.name} a las ${p.time}. Status: Exito (ID: ${res.id})`);
        } catch (e) {
            console.log(`❌ Error al reservar para ${p.name} a las ${p.time}:`, e.message);
        }
    }
    
    console.log("\n>>> [FIN] Reservas inyectadas. Revisar DB/Admin.");
    process.exit(0);
}

run().catch(console.error);
