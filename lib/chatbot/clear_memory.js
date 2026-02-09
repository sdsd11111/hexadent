const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function getEnv() {
    const envPath = path.join(__dirname, '..', '..', '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    });
    return env;
}

async function clearMemory(phones) {
    const env = getEnv();
    const connection = await mysql.createConnection({
        host: env.MYSQL_HOST,
        port: parseInt(env.MYSQL_PORT),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE
    });

    try {
        for (const phone of phones) {
            const cleanPhone = phone.replace(/\D/g, '');
            console.log(`Clearing memory for: ${cleanPhone}`);

            const tables = ['chatbot_logs', 'chatbot_sessions', 'handoff_sessions', 'chatbot_buffer', 'chatbot_locks'];

            for (const table of tables) {
                try {
                    const [res] = await connection.execute(`DELETE FROM ${table} WHERE phone = ?`, [cleanPhone]);
                    console.log(`- ${table}: deleted ${res.affectedRows} records.`);
                } catch (err) {
                    console.log(`- ${table}: ${err.message}`);
                }
            }
        }
        console.log("Memory clearing COMPLETED.");
    } catch (error) {
        console.error("Critical Error clearing memory:", error.message);
    } finally {
        await connection.end();
    }
}

// Clear memory for test numbers
clearMemory(['593963410409', '591611369711563758621']);
