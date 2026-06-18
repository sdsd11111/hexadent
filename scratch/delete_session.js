import fs from 'fs';
import path from 'path';

if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^['\"](.*)['\"]$/, '$1').trim();
            process.env[key.trim()] = value;
        }
    });
}

import db from '../lib/db.js';

async function deleteSession() {
    const phone = '593963410409';
    const cleanPhone = phone.replace(/\D/g, '');
    
    console.log(`Clearing session and logs for ${cleanPhone}...`);
    try {
        const [res1] = await db.execute('DELETE FROM chatbot_sessions WHERE phone = ?', [cleanPhone]);
        console.log(`Deleted chatbot_sessions: ${res1.affectedRows} rows`);
        
        const [res2] = await db.execute('DELETE FROM chatbot_logs WHERE phone = ?', [cleanPhone]);
        console.log(`Deleted chatbot_logs: ${res2.affectedRows} rows`);
        
        const [res3] = await db.execute('DELETE FROM handoff_sessions WHERE phone = ?', [cleanPhone]);
        console.log(`Deleted handoff_sessions: ${res3.affectedRows} rows`);
        
        const [res4] = await db.execute('DELETE FROM chatbot_locks WHERE phone = ?', [cleanPhone]);
        console.log(`Deleted chatbot_locks: ${res4.affectedRows} rows`);
        
        console.log('Success! Done.');
        process.exit(0);
    } catch (e) {
        console.error('Error clearing data:', e);
        process.exit(1);
    }
}

deleteSession();
