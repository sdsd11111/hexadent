import fs from 'fs';
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

const { default: db } = await import('./lib/db.js');

const phonesToWipe = ['593967491847', '593963410409'];

for (const phoneToWipe of phonesToWipe) {
    console.log(`\n🗑️  Borrando memoria para: ${phoneToWipe}`);

    // 1. Delete session
    const [sessionDelete] = await db.execute('DELETE FROM chatbot_sessions WHERE phone = ?', [phoneToWipe]);
    console.log(`✅ Sesión borrada: ${sessionDelete.affectedRows} registro(s)`);

    // 2. Delete conversation history
    const [logsDelete] = await db.execute('DELETE FROM chatbot_logs WHERE phone = ?', [phoneToWipe]);
    console.log(`✅ Historial borrado: ${logsDelete.affectedRows} mensaje(s)`);

    // 3. Delete any locks
    const [lockDelete] = await db.execute('DELETE FROM chatbot_locks WHERE phone = ?', [phoneToWipe]);
    console.log(`✅ Locks borrados: ${lockDelete.affectedRows}`);

    // 4. Delete buffer
    const [bufferDelete] = await db.execute('DELETE FROM chatbot_buffer WHERE phone = ?', [phoneToWipe]);
    console.log(`✅ Buffer borrado: ${bufferDelete.affectedRows}`);

    // 5. Delete handoff session
    const [handoffDelete] = await db.execute('DELETE FROM handoff_sessions WHERE phone = ?', [phoneToWipe]);
    console.log(`✅ Handoff borrado: ${handoffDelete.affectedRows}`);

    console.log(`🎉 Memoria completamente borrada para ${phoneToWipe}`);
}

console.log(`\nTodos los números indicados han sido limpiados.`);
process.exit(0);
