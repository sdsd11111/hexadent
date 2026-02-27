import db from './lib/db.js';
async function run() {
    try {
        const [rows] = await db.execute('DESCRIBE appointments');
        process.stdout.write(JSON.stringify(rows, null, 2));
    } catch (e) {
        process.stderr.write(e.message);
    }
    process.exit(0);
}
run();
