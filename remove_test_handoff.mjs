// Remove handoff for test number
import db from './lib/db.js';

async function removeHandoff() {
    const phone = '593967491847';
    
    console.log(`[CHECKING] Handoff for: ${phone}`);
    
    const [h] = await db.execute('SELECT * FROM handoff_sessions WHERE phone = ?', [phone]);
    console.log('Handoff found:', h);
    
    if (h.length > 0) {
        await db.execute('DELETE FROM handoff_sessions WHERE phone = ?', [phone]);
        console.log('✅ Handoff REMOVED! Bot will respond now.');
    } else {
        console.log('No handoff - bot should respond.');
    }
    
    process.exit(0);
}

removeHandoff();