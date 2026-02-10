import { NextResponse } from 'next/server';
import mediaDb from '@/lib/media-db';
import { v4 as uuidv4 } from 'uuid';

// Max duration for large file processing
export const maxDuration = 300;

let isTableChecked = false;
async function ensureMediaTableExists() {
    if (isTableChecked) return;

    try {
        // Create table if not exists with correct columns
        await mediaDb.execute(`
            CREATE TABLE IF NOT EXISTS galerias_pacientes (
                id VARCHAR(36) PRIMARY KEY,
                cedula_paciente VARCHAR(50) NOT NULL,
                ficha_id VARCHAR(36),
                modulo VARCHAR(50) NOT NULL DEFAULT 'odontologia',
                nombre VARCHAR(255),
                tipo VARCHAR(20),
                categoria VARCHAR(50),
                data LONGBLOB NOT NULL,
                mime_type VARCHAR(100),
                size INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_cedula (cedula_paciente),
                INDEX idx_ficha (ficha_id),
                INDEX idx_modulo (modulo),
                INDEX idx_cedula_modulo (cedula_paciente, modulo),
                INDEX idx_categoria (categoria)
            )
        `);

        // Migration check only once per server instance lifetime
        try {
            const [columns] = await mediaDb.execute('SHOW COLUMNS FROM galerias_pacientes LIKE "modulo"');
            if (columns.length === 0) {
                await mediaDb.execute('ALTER TABLE galerias_pacientes ADD COLUMN modulo VARCHAR(50) NOT NULL DEFAULT "odontologia" AFTER ficha_id');
                await mediaDb.execute('CREATE INDEX idx_modulo ON galerias_pacientes (modulo)');
                await mediaDb.execute('CREATE INDEX idx_cedula_modulo ON galerias_pacientes (cedula_paciente, modulo)');
                console.log('✓ Migration: Added modulo column and indexes');
            }
        } catch (mErr) {
            console.error('Migration detail check failed:', mErr.message);
        }

        isTableChecked = true;
    } catch (err) {
        console.error('Media table initialization error:', err.message);
        throw err; // Re-throw so the endpoint knows the DB is not ready
    }
}

export async function POST(request) {
    try {
        await ensureMediaTableExists();

        const formData = await request.formData();
        const file = formData.get('file');
        const cedula = formData.get('cedula');
        const modulo = formData.get('modulo') || 'odontologia';
        const categoria = formData.get('categoria') || 'Diagnóstico';
        const nombre = formData.get('nombre') || file?.name;
        const fichaId = formData.get('ficha_id');

        if (!file || !cedula) {
            return NextResponse.json({ error: 'Faltan datos requeridos (archivo o cédula)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        // Stricter limits for Vercel (Max 4.5MB payload limit on Hobby/Pro)
        // We set it to 4MB to be safe with overhead
        const maxSize = 4 * 1024 * 1024;

        if (file.size > maxSize) {
            return NextResponse.json({
                error: `El archivo excede el límite de 4MB (Restricción de infraestructura).`,
                detail: `Tamaño intentado: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Vercel limita las cargas a 4.5MB.`
            }, { status: 413 });
        }

        const id = uuidv4();
        const tipo = isVideo ? 'video' : (isImage ? 'foto' : (file.type === 'application/pdf' ? 'pdf' : 'archivo'));

        try {
            await mediaDb.execute(
                `INSERT INTO galerias_pacientes (id, cedula_paciente, ficha_id, modulo, nombre, tipo, categoria, data, mime_type, size) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, cedula, fichaId || null, modulo, nombre, tipo, categoria, buffer, file.type, file.size]
            );

            const record = {
                id,
                cedula_paciente: cedula,
                ficha_id: fichaId || null,
                modulo,
                nombre,
                tipo,
                categoria,
                mime_type: file.type,
                size: file.size,
                created_at: new Date().toISOString()
            };

            return NextResponse.json({
                message: 'Media guardado con éxito',
                id,
                media: record
            }, { status: 201 });
        } catch (dbError) {
            console.error('Database INSERT error:', dbError);
            return NextResponse.json({
                error: 'Error al guardar en la base de datos',
                detail: dbError.message,
                dbCode: dbError.code
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({
            error: 'Error interno en el servidor de carga',
            detail: error.message
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await ensureMediaTableExists();
        const { searchParams } = new URL(request.url);
        const cedula = searchParams.get('cedula');
        const fichaId = searchParams.get('ficha_id');
        const modulo = searchParams.get('modulo');

        if (!cedula && !fichaId) {
            return NextResponse.json({ error: 'Cédula o ID de ficha requerido' }, { status: 400 });
        }

        let query = 'SELECT id, cedula_paciente, ficha_id, modulo, nombre, tipo, categoria, mime_type, size, created_at FROM galerias_pacientes WHERE 1=1';
        let params = [];

        if (cedula) {
            query += ' AND cedula_paciente = ?';
            params.push(cedula);
        }

        if (fichaId) {
            query += ' AND ficha_id = ?';
            params.push(fichaId);
        }

        if (modulo) {
            query += ' AND modulo = ?';
            params.push(modulo);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await mediaDb.execute(query, params);

        return NextResponse.json({ media: rows });
    } catch (error) {
        console.error('Error fetching media list:', error);
        return NextResponse.json({ error: 'Error al obtener lista de media', details: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, nombre, categoria } = body;

        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

        await mediaDb.execute(
            'UPDATE galerias_pacientes SET nombre = ?, categoria = ? WHERE id = ?',
            [nombre, categoria, id]
        );

        return NextResponse.json({ message: 'Media actualizado con éxito' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar', details: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

        await mediaDb.execute('DELETE FROM galerias_pacientes WHERE id = ?', [id]);

        return NextResponse.json({ message: 'Media eliminado con éxito' });
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar', details: error.message }, { status: 500 });
    }
}
