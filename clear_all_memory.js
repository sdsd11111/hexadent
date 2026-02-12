import db from './lib/db.js';

async function clearMemory() {
    try {
        console.log('--- RESETTING CHATBOT MEMORY ---');

        const tables = [
            'chatbot_logs',
            'chatbot_sessions',
            'chatbot_buffer',
            'chatbot_locks',
            'chatbot_locked_slots',
            'handoff_sessions',
            'chatbot_failed_metadata'
        ];

        for (const table of tables) {
            try {
                // Use TRUNCATE if possible or DELETE
                await db.execute(`DELETE FROM ${table}`);
                console.log(`✅ Table ${table} cleared.`);
            } catch (err) {
                if (err.code === 'ER_NO_SUCH_TABLE' || err.message.includes("doesn't exist")) {
                    console.log(`ℹ️ Table ${table} does not exist, skipping.`);
                } else {
                    console.error(`❌ Error clearing ${table}:`, err.message);
                }
            }
        }

        console.log('\n✨ All memory has been wiped clean.');
        process.exit(0);
    } catch (error) {
        console.error('FATAL Error clearing memory:', error.message);
        process.exit(1);
    }
}

clearMemory();
