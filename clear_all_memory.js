import db from './lib/db.js';

async function clearMemory() {
    try {
        console.log('Clearing all chatbot memory components...');

        // 1. Logs
        await db.execute('DELETE FROM chatbot_logs');
        console.log('- Logs cleared.');

        // 2. Sessions (Name/Cedula)
        await db.execute('DELETE FROM chatbot_sessions');
        console.log('- Sessions cleared.');

        // 3. Buffer and Locks
        await db.execute('DELETE FROM chatbot_buffer');
        await db.execute('DELETE FROM chatbot_locks');
        console.log('- Concurrency tables cleared.');

        // 4. Handoff Sessions (Human override)
        // Check if table exists first (just in case)
        await db.execute('DELETE FROM handoff_sessions');
        console.log('- Handoff sessions (silence) cleared.');

        console.log('Memory reset successful.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing memory:', error.message);
        process.exit(1);
    }
}

clearMemory();
