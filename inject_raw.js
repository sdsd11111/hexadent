const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
    const env = {};
    if (fs.existsSync('.env')) {
        const lines = fs.readFileSync('.env', 'utf8').split('\n');
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '').replace(/[\r\n]/g, '');
                if (k && !k.startsWith('#')) {
                    env[k] = v;
                }
            }
        });
    }

    const db = await mysql.createConnection({
        host: env.MYSQL_HOST,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        port: parseInt(env.MYSQL_PORT || 3306)
    });

    const dt = new Date();
    dt.setDate(dt.getDate() + 1); // Tomorrow
    const dateStr = dt.toISOString().split('T')[0];

    const dt2 = new Date();
    dt2.setDate(dt2.getDate() + 2); // Day after tomorrow
    const dateStr2 = dt2.toISOString().split('T')[0];

    const patients = [
        { name: "Ana Gomez", phone: "593993334555", cedula: "1722334455", date: dateStr, time: "16:15", duration: 45, motive: "Blanqueamiento Test" },
        { name: "Mario Vargas (Hijo)", phone: "593995556777", cedula: "MENOR", age: 10, date: dateStr2, time: "11:00", duration: 20, motive: "Odontopediatría Test" },
        { name: "Carlos Ruiz", phone: "593997778888", cedula: "1711223344", date: dateStr2, time: "15:30", duration: 30, motive: "Limpieza Test" }
    ];

    console.log(`>>> Injecting for date: ${dateStr}`);
    for (const p of patients) {
        try {
            await db.execute(
                'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled", ?)',
                [p.name, p.phone, p.cedula, p.age || null, p.date, p.time, p.duration, p.motive]
            );
            console.log(`✅ Appointment inserted for ${p.name} at ${p.time}`);
        } catch (e) {
            console.log(`❌ Error for ${p.name}:`, e.message);
        }
    }
    
    console.log("\n>>> Check /admin now.");
    process.exit(0);
}

run().catch(console.error);
