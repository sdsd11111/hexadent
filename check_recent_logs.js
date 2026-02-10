import db from './lib/db.js';

async function check() {
    try {
        const [rows] = await db.execute('SELECT * FROM chatbot_logs ORDER BY timestamp DESC LIMIT 3');
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

check();
