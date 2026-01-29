import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Route Segment Config
export const maxDuration = 300; // Allow more time for processing large images

async function ensureTableExists() {
    // Tabla de Pacientes (Maestra)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS pacientes (
            cedula VARCHAR(50) PRIMARY KEY,
            nombre VARCHAR(100),
            apellido VARCHAR(100),
            data LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `).catch(err => console.log('Pacientes table error:', err.message));

    // Tabla de Fichas (Clínica)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS fichas (
            id VARCHAR(36) PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            cedula VARCHAR(50),
            data LONGTEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_cedula (cedula),
            INDEX idx_type (type)
        )
    `).catch(err => console.log('Fichas table error:', err.message));
}

export async function POST(request) {
    try {
        await ensureTableExists();
        const body = await request.json();
        const { fichaType, data } = body;

        // Validar campos requeridos
        if (!fichaType || !data) {
            return NextResponse.json(
                { error: 'Tipo de ficha y datos son requeridos' },
                { status: 400 }
            );
        }

        const id = uuidv4();
        const cedula = data.cedula || null;

        // 1. Sincronizar Paciente (Upsert)
        if (cedula) {
            const patientMetadata = JSON.stringify({
                telefono: data.telefono,
                email: data.email,
                direccion: data.direccion,
                fecha_nacimiento: data.fecha_nacimiento,
                genero: data.genero
            });

            await db.execute(
                `INSERT INTO pacientes (cedula, nombre, apellido, data) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 nombre = VALUES(nombre), 
                 apellido = VALUES(apellido), 
                 data = VALUES(data)`,
                [cedula, data.nombre || '', data.apellido || '', patientMetadata]
            );
        }

        // 2. Guardar Ficha
        const jsonData = JSON.stringify(data);
        await db.execute(
            'INSERT INTO fichas (id, type, cedula, data) VALUES (?, ?, ?, ?)',
            [id, fichaType, cedula, jsonData]
        );

        return NextResponse.json(
            {
                message: 'Ficha y datos de paciente guardados exitosamente',
                id: id
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error saving ficha:', error);
        return NextResponse.json(
            { error: 'Error al guardar la ficha', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        await ensureTableExists();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const summary = searchParams.get('summary');

        if (summary === 'true') {
            const [rows] = await db.execute(`
                SELECT type, COUNT(DISTINCT cedula) as count 
                FROM fichas 
                GROUP BY type
            `);

            // Map to a more useful format
            const counts = {
                odontologia: 0,
                ortopedia: 0,
                ortodoncia: 0
            };

            rows.forEach(row => {
                if (counts.hasOwnProperty(row.type)) {
                    counts[row.type] = row.count;
                }
            });

            return NextResponse.json({ counts }, { status: 200 });
        }

        let query = `
            SELECT f.*, p.nombre as patient_nombre, p.apellido as patient_apellido 
            FROM fichas f
            LEFT JOIN pacientes p ON f.cedula = p.cedula
        `;
        let params = [];

        if (type) {
            query += ' WHERE f.type = ?';
            params.push(type);
        }

        const cedula = searchParams.get('cedula');
        if (cedula) {
            query += type ? ' AND f.cedula = ?' : ' WHERE f.cedula = ?';
            params.push(cedula);
        }

        query += ' ORDER BY f.created_at DESC';

        const [rows] = await db.execute(query, params);

        const formattedFichas = rows.map(row => {
            const fichaData = row.data ? JSON.parse(row.data) : {};
            // Consolidar nombre/apellido desde la tabla pacientes si están disponibles
            if (row.patient_nombre) fichaData.nombre = row.patient_nombre;
            if (row.patient_apellido) fichaData.apellido = row.patient_apellido;

            return {
                id: row.id,
                type: row.type,
                data: fichaData,
                timestamp: row.created_at
            };
        });

        return NextResponse.json(
            {
                fichas: formattedFichas,
                total: formattedFichas.length
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching fichas:', error);
        return NextResponse.json(
            { error: 'Error al obtener las fichas', details: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        await ensureTableExists();
        const body = await request.json();
        const { id, data, updateType, imagenes } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
        }

        // Full update requires data
        if (!updateType && !data) {
            return NextResponse.json({ error: 'Datos son requeridos para actualización completa' }, { status: 400 });
        }

        // 1. Sincronizar Paciente (Solo si es actualización completa y hay cédula)
        if (!updateType && data && data.cedula) {
            const patientMetadata = JSON.stringify({
                telefono: data.telefono,
                email: data.email,
                direccion: data.direccion,
                fecha_nacimiento: data.fecha_nacimiento,
                genero: data.genero
            });

            await db.execute(
                `INSERT INTO pacientes (cedula, nombre, apellido, data) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 nombre = VALUES(nombre), 
                 apellido = VALUES(apellido), 
                 data = VALUES(data)`,
                [data.cedula, data.nombre || '', data.apellido || '', patientMetadata]
            );
        }

        const jsonData = JSON.stringify(data);

        // 2. Handle partial or full update
        if (updateType === 'imagenes_only' && imagenes) {
            // Get current data first to merge
            const [current] = await db.execute('SELECT data FROM fichas WHERE id = ?', [id]);
            if (current.length > 0) {
                const currentData = JSON.parse(current[0].data);
                currentData.imagenes = imagenes;
                await db.execute(
                    'UPDATE fichas SET data = ? WHERE id = ?',
                    [JSON.stringify(currentData), id]
                );
            }
        } else {
            // Full update
            const cedula = data?.cedula || null;
            await db.execute(
                'UPDATE fichas SET data = ?, cedula = ? WHERE id = ?',
                [jsonData, cedula, id]
            );
        }

        return NextResponse.json({ message: 'Ficha y datos de paciente actualizados exitosamente' });
    } catch (error) {
        console.error('Error updating ficha:', error);
        return NextResponse.json(
            { error: 'Error al actualizar la ficha', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        await db.execute('DELETE FROM fichas WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Ficha eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting ficha:', error);
        return NextResponse.json({ error: 'Error al eliminar la ficha', details: error.message }, { status: 500 });
    }
}
