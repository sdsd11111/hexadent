
import db from './lib/db.js';
import fs from 'fs';

async function check() {
    try {
        if (fs.existsSync('.env')) {
            const env = fs.readFileSync('.env', 'utf8');
            console.log("ENV FOUND");
        }
        const [rows] = await db.execute('SELECT 1');
        console.log("DB_OK", rows);
    } catch (err) {
        console.error("DB_FAIL", err);
    }
}

check().then(() => process.exit(0));
