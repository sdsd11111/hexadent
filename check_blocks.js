import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { default: db } = await import('./lib/db.js');

console.log("=== CHECKING BLOCKED DATES ===");
const [rows] = await db.execute('SELECT blocked_date, reason FROM blocked_dates WHERE blocked_date >= CURDATE() ORDER BY blocked_date');
console.log(`Found ${rows.length} blocked dates:`);
rows.forEach(r => {
    const dateStr = r.blocked_date.toISOString().split('T')[0];
    console.log(`  - ${dateStr}: ${r.reason || 'No reason'}`);
});

console.log("\n=== CHECKING FEB 13 SPECIFICALLY ===");
const [feb13] = await db.execute('SELECT * FROM blocked_dates WHERE blocked_date = ?', ['2026-02-13']);
console.log(feb13.length > 0 ? `✅ Feb 13 IS blocked: ${feb13[0].reason}` : '❌ Feb 13 is NOT blocked');

process.exit(0);
