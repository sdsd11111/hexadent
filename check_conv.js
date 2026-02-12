import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { default: db } = await import('./lib/db.js');

const phone = '593963410409';
const [rows] = await db.execute(
    'SELECT user_msg, bot_resp, timestamp FROM chatbot_logs WHERE phone = ? ORDER BY timestamp DESC LIMIT 8',
    [phone]
);

console.log("=== ÚLTIMAS CONVERSACIONES ===\n");
rows.reverse().forEach((r, i) => {
    console.log(`[${i + 1}] USER: ${r.user_msg}`);
    console.log(`    BOT: ${r.bot_resp.substring(0, 200)}${r.bot_resp.length > 200 ? '...' : ''}\n`);
});

process.exit(0);
