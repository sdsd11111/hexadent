import fs from 'fs';
import mysql from 'mysql2/promise';

async function clearHistory() {
    // Parse .env manually
    const envFile = fs.readFileSync('.env', 'utf-8');
    const getEnv = (key) => {
        const lines = envFile.split('\n');
        for (const line of lines) {
            if (line.startsWith(`${key}=`)) {
                return line.split('=')[1].trim();
            }
        }
        return null;
    };

    const host = getEnv('MYSQL_HOST');
    const port = parseInt(getEnv('MYSQL_PORT') || '3306');
    const user = getEnv('MYSQL_USER');
    const password = getEnv('MYSQL_PASSWORD');
    const database = getEnv('MYSQL_DATABASE');

    const phone = '593983237491';
    
    try {
        console.log(`Conectando a base de datos remota: ${host}...`);
        const connection = await mysql.createConnection({ host, port, user, password, database });
        
        console.log(`Borrando historial para el número ${phone}...`);
        const [result] = await connection.execute('DELETE FROM chatbot_logs WHERE phone = ?', [phone]);
        console.log(`Limpio. Se borraron ${result.affectedRows} mensajes.`);
        
        const [resultHandoff] = await connection.execute('DELETE FROM handoff_sessions WHERE phone = ?', [phone]);
        console.log(`Sesiones de asistente humano borradas: ${resultHandoff.affectedRows}`);
        
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

clearHistory();
