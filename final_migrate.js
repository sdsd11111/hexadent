
import db from './lib/db.js';

async function migrate() {
    console.log('Running robust migration...');
    const commands = [
        "ALTER TABLE chatbot_sessions ADD COLUMN age INT",
        "ALTER TABLE chatbot_sessions ADD COLUMN current_flow TEXT",
        "ALTER TABLE chatbot_sessions ADD COLUMN metadata JSON",
        "ALTER TABLE appointments ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0"
    ];

    for (const cmd of commands) {
        try {
            console.log(`Executing: ${cmd}`);
            await db.execute(cmd);
            console.log('Success.');
        } catch (e) {
            if (e.message.includes('Duplicate column name')) {
                console.log('Column already exists, skipping.');
            } else {
                console.error(`Error: ${e.message}`);
            }
        }
    }
    console.log('Migration process finished.');
    process.exit(0);
}

migrate();
