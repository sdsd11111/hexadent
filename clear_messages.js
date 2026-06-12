import('./lib/db.js').then(async (mod) => {
    const db = mod.default;
    const phone = '593967491847';
    
    const [result] = await db.execute(
        'DELETE FROM chatbot_logs WHERE phone = ? OR phone LIKE ?',
        [phone, '%' + phone]
    );
    console.log(`Deleted ${result.affectedRows} messages for phone ${phone}`);
    process.exit(0);
});