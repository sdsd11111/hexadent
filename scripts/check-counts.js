const db = require('../lib/db');

async function checkCounts() {
    try {
        const [rows] = await db.execute('SELECT type, COUNT(*) as count FROM fichas GROUP BY type');
        console.log('Fichas counts by type:', rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkCounts();
