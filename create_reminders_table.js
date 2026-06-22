// Create appointment_reminders table
import db from './lib/db.js';

async function createTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS appointment_reminders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                appointment_id INT NOT NULL,
                phone VARCHAR(20) NOT NULL,
                sent_at DATETIME NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                confirmed_at DATETIME NULL,
                INDEX idx_phone (phone),
                INDEX idx_status (status)
            )
        `);
        console.log("✅ Tabla appointment_reminders creada");
    } catch (err) {
        console.error("Error:", err.message);
    }
}

createTable().then(() => process.exit());