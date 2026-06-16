import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function fixDatabaseSchema() {
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        if (key && val.length > 0) acc[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
        return acc;
    }, {});

    const config = {
        host: env.MYSQL_HOST,
        port: parseInt(env.MYSQL_PORT),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    };

    try {
        const connection = await mysql.createConnection(config);
        
        console.log('--- Dropping UNIQUE index idx_slot from appointments ---');
        await connection.execute('ALTER TABLE appointments DROP INDEX idx_slot');
        console.log('✅ UNIQUE index idx_slot successfully dropped!');

        console.log('--- SHOW INDEX FROM appointments ---');
        const [indexes] = await connection.execute('SHOW INDEX FROM appointments');
        console.table(indexes);

        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.stack);
    }
}

fixDatabaseSchema();
