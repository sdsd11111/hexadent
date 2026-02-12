import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { default: db } = await import('./lib/db.js');

// Change this to the phone number you want to wipe
const phoneToWipe = '593963410409'; // Your test number

console.log(`🗑️  Borrando memoria para: ${phoneToWipe}\n`);

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

console.log(`\n🎉 Memoria completamente borrada para ${phoneToWipe}`);
console.log(`El bot ahora tratará al usuario como si fuera la primera vez.`);

process.exit(0);
