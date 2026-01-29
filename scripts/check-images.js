const pool = require('../lib/db');
// Depending on how node handles the export, it might be in .default
const db = pool.default || pool;

async function checkImages() {
    try {
        const [fichas] = await db.execute('SELECT id, type, data FROM fichas');
        console.log(`Found ${fichas.length} fichas.`);

        fichas.forEach(ficha => {
            let data;
            try {
                data = JSON.parse(ficha.data);
            } catch (e) {
                console.log(`Ficha ${ficha.id}: Error parsing JSON data`);
                return;
            }
            const imagesCount = data.imagenes ? data.imagenes.length : 0;
            let totalPhotos = 0;
            if (data.imagenes && Array.isArray(data.imagenes)) {
                data.imagenes.forEach(day => {
                    totalPhotos += day.data ? day.data.length : 0;
                });
            }
            console.log(`Ficha ${ficha.id} (${ficha.type}): ${imagesCount} days of images, ${totalPhotos} total photos.`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkImages();
