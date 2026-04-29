
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function test() {
    console.log("--- STARTING DB CONNECTION TEST ---");
    
    let env = {};
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, ...val] = line.split('=');
            if (key && val.length > 0) {
                env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
            }
        });
        console.log("✅ .env loaded");
    } catch (e) {
        console.error("❌ Error loading .env:", e.message);
        return;
    }

    const config = {
        host: env.MYSQL_HOST,
        port: parseInt(env.MYSQL_PORT) || 3306,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        connectTimeout: 10000
    };

    console.log(`Connecting to ${config.host}:${config.port} as ${config.user}...`);

    try {
        const connection = await mysql.createConnection(config);
        console.log("✅ SUCCESS! Connected to database.");
        
        const [rows] = await connection.execute('SELECT * FROM blocked_dates ORDER BY blocked_date ASC');
        console.log("\n--- TODOS LOS DÍAS BLOQUEADOS ---");
        console.table(rows);
        
        await connection.end();
    } catch (err) {
        console.error("\n❌ CONNECTION FAILED!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        
        if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
            console.log("\n[ANALYSIS] El servidor MySQL está rechazando la conexión externa.");
            console.log("Esto es común en hostings compartidos (StackCP) si la IP del cliente no está en la lista blanca.");
        }
    }
}

test();
