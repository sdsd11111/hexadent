const mysql = require('mysql2/promise');

const config1 = {
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
};

const config2 = {
    host: 'mysql.us.stackcp.com',
    port: 39908,
    user: 'odontologa-35303936dec6',
    password: 'dhoy9qbzlu',
    database: 'odontologa-35303936dec6'
};

const phones = ['593963410409', '593967491847'];

async function runDelete(config, label) {
    console.log(`Trying database connection: ${label}...`);
    try {
        const db = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            connectTimeout: 5000
        });
        
        console.log(`Connected to ${label} successfully!`);
        for (const phone of phones) {
            console.log(`Deleting for phone: ${phone}...`);
            const [res1] = await db.execute('DELETE FROM chatbot_sessions WHERE phone = ?', [phone]);
            console.log(`- Deleted from chatbot_sessions: ${res1.affectedRows} rows`);
            
            const [res2] = await db.execute('DELETE FROM chatbot_logs WHERE phone = ?', [phone]);
            console.log(`- Deleted from chatbot_logs: ${res2.affectedRows} rows`);
            
            const [res3] = await db.execute('DELETE FROM handoff_sessions WHERE phone = ?', [phone]);
            console.log(`- Deleted from handoff_sessions: ${res3.affectedRows} rows`);
            
            const [res4] = await db.execute('DELETE FROM chatbot_locks WHERE phone = ?', [phone]);
            console.log(`- Deleted from chatbot_locks: ${res4.affectedRows} rows`);
        }
        await db.end();
        console.log(`Done with ${label}.\n`);
        return true;
    } catch (err) {
        console.warn(`Connection failed for ${label}:`, err.message);
        return false;
    }
}

async function main() {
    const success1 = await runDelete(config1, 'PDFs-Texto (Port 43192)');
    const success2 = await runDelete(config2, 'Odontologa (Port 39908)');
    if (!success1 && !success2) {
        console.error('All connection attempts failed. This machine does not have access to the DB host.');
    }
    process.exit(0);
}

main();
