import 'dotenv/config';
import db from './lib/db.js';

async function check() {
    try {
        const [ignored] = await db.execute('SELECT * FROM ignored_numbers');
        console.log('Ignored Numbers:', ignored);
        
        const [handoff] = await db.execute('SELECT * FROM handoff_sessions');
        console.log('Handoff Sessions:', handoff);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
