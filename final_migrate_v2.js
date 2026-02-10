
import db from './lib/db.js';

async function migrate() {
    console.log('Final migration attempt...');
    const commands = [
        "ALTER TABLE chatbot_sessions ADD COLUMN age INT",
        "ALTER TABLE chatbot_sessions ADD COLUMN current_flow TEXT",
        "ALTER TABLE chatbot_sessions ADD COLUMN metadata TEXT", // Changed JSON to TEXT for compatibility
        "ALTER TABLE appointments ADD COLUMN reminder_sent TINYINT(1) DEFAULT 0"
    ];

    for (const cmd of commands) {
        try {
            console.log(`Executing: ${cmd}`);
            await db.execute(cmd);
            console.log('Success.');
        } catch (e) {
            if (e.message.includes('Duplicate column name')) {
                console.log('Column already exists.');
            } else {
                console.error(`Error on: ${cmd}\nMessage: ${e.message}`);
            }
        }
    }
    process.exit(0);
}

migrate();
