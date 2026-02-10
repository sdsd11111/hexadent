
import db from './lib/db.js';

async function migrate() {
    console.log('Starting migration for chatbot_sessions...');
    const columns = [
        { name: 'age', type: 'INT' },
        { name: 'current_flow', type: 'TEXT' },
        { name: 'metadata', type: 'JSON' }
    ];

    for (const col of columns) {
        try {
            console.log(`Adding column ${col.name}...`);
            await db.execute(`ALTER TABLE chatbot_sessions ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Column ${col.name} added.`);
        } catch (e) {
            if (e.message.includes('Duplicate column name')) {
                console.log(`Column ${col.name} already exists.`);
            } else {
                console.error(`Error adding ${col.name}:`, e.message);
            }
        }
    }
    console.log('Migration finished.');
    process.exit(0);
}

migrate();
