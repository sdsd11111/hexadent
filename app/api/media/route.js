import { NextResponse } from 'next/server';
import mediaDb from '@/lib/media-db';
import { v4 as uuidv4 } from 'uuid';

// Max duration for large file processing
export const maxDuration = 300;

async function ensureMediaTableExists() {
    // Create table if not exists
    await mediaDb.execute(`
        CREATE TABLE IF NOT EXISTS galerias_pacientes (
            id VARCHAR(36) PRIMARY KEY,
            cedula_paciente VARCHAR(50) NOT NULL,
            ficha_id VARCHAR(36),
            modulo VARCHAR(50) NOT NULL,
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
    `).catch(err => console.error('Media table error:', err.message));

    // Migration: Add modulo column if it doesn't exist
    try {
        await mediaDb.execute(`
            ALTER TABLE galerias_pacientes 
            ADD COLUMN modulo VARCHAR(50) NOT NULL DEFAULT 'odontologia' AFTER ficha_id
        `);
        console.log('✓ Added modulo column to galerias_pacientes');

        // Add indexes for modulo
        await mediaDb.execute('CREATE INDEX idx_modulo ON galerias_pacientes (modulo)');
        await mediaDb.execute('CREATE INDEX idx_cedula_modulo ON galerias_pacientes (cedula_paciente, modulo)');
        console.log('✓ Added modulo indexes');
    } catch (err) {
        // Column already exists, ignore error
        if (err.code !== 'ER_DUP_FIELDNAME') {
            console.log('Migration check:', err.message);
        }
    }
}

export async function POST(request) {
    try {
        await ensureMediaTableExists();
        const formData = await request.formData();

        const file = formData.get('file');
        const cedula = formData.get('cedula');
        const fichaId = formData.get('ficha_id');
        const modulo = formData.get('modulo');
        const categoria = formData.get('categoria');
        const nombre = formData.get('nombre') || file.name;

        if (!file || !cedula || !categoria || !modulo) {
            return NextResponse.json({ error: 'Faltan campos obligatorios (archivo, cédula, categoría, módulo)' }, { status: 400 });
        }

        // Differentiated limits
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPDF = file.type === 'application/pdf';

        let maxSize = 1 * 1024 * 1024; // Default 1MB for images and docs
        if (isVideo) maxSize = 10 * 1024 * 1024; // 10MB for videos

        if (file.size > maxSize) {
            const limitDesc = isVideo ? '10MB' : '1MB';
            return NextResponse.json({ error: `El archivo excede el límite de ${limitDesc}` }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const id = uuidv4();
        const tipo = file.type.startsWith('image/') ? 'foto' : (file.type.startsWith('video/') ? 'video' : 'pdf');

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
    } catch (error) {
        console.error('Error in media upload:', error);
        return NextResponse.json({ error: 'Error al subir media', details: error.message }, { status: 500 });
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
