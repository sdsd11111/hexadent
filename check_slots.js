import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

const slots = await getAvailableSlots('2026-06-15', 45, '593967491847');
console.log('Available slots on June 15:', slots);
process.exit(0);