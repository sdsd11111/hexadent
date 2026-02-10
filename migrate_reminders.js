
import db from './lib/db.js';

async function migrate() {
    console.log('Adding reminder_sent to appointments...');
    try {
        await db.execute(`
            ALTER TABLE appointments 
            ADD COLUMN IF NOT EXISTS reminder_sent TINYINT(1) DEFAULT 0
        `);
        console.log('Migration successful.');
    } catch (e) {
        console.error('Migration failed:', e.message);
    }
    process.exit(0);
}

migrate();
