import db from './lib/db.js';

async function check() {
    const [rows] = await db.execute(
        `SELECT id, patient_name, patient_phone, appointment_date, appointment_time, status 
         FROM appointments 
         WHERE patient_phone LIKE '%967491847%' OR patient_phone LIKE '%593967491847%'
         ORDER BY id DESC LIMIT 5`
    );
    console.log("Citas encontradas:", rows);
}

check().then(() => process.exit());