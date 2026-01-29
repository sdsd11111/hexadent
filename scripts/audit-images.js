const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkImages() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log('Connected to MySQL successfully.');
        const [fichas] = await connection.execute('SELECT id, type, data FROM fichas');
        console.log(`Found ${fichas.length} total fichas.`);

        fichas.forEach(ficha => {
            let data;
            try {
                data = JSON.parse(ficha.data);
            } catch (e) {
                console.log(`Ficha ${ficha.id}: Error parsing JSON`);
                return;
            }

            const images = data.imagenes || [];
            if (images.length > 0) {
                let photos = 0;
                images.forEach(day => { photos += (day.data || []).length; });
                console.log(`[OK] Ficha ${ficha.id} (${ficha.type}): ${images.length} day(s), ${photos} total photo(s).`);
                if (photos > 0) {
                    console.log(`     First photo size: ${images[0].data[0].length} chars`);
                }
            } else {
                console.log(`[EMPTY] Ficha ${ficha.id} (${ficha.type}): No images.`);
            }
        });

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkImages();
