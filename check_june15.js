import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { default: db } = await import('./lib/db.js');

const [rows] = await db.execute('SELECT * FROM appointments WHERE appointment_date = ?', ['2026-06-15']);
console.log('Appointments on June 15:', JSON.stringify(rows, null, 2));
process.exit(0);