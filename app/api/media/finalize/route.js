
import { NextResponse } from 'next/server';
import mediaDb from '@/lib/media-db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const body = await request.json();
        const { uploadId, cedula, modulo, categoria, nombre, mime_type, size, ficha_id } = body;

        if (!uploadId || !cedula) {
            return NextResponse.json({ error: 'Faltan datos para finalizar la carga' }, { status: 400 });
        }

        console.log(`[Finalize] Merging chunks for upload: ${uploadId}`);

        // Get all chunks in order
        const [chunks] = await mediaDb.execute(
            'SELECT data FROM media_upload_chunks WHERE upload_id = ? ORDER BY chunk_index ASC',
            [uploadId]
        );

        if (chunks.length === 0) {
            return NextResponse.json({ error: 'No se encontraron fragmentos para este ID' }, { status: 404 });
        }

        // Concatenate buffers
        const bufferList = chunks.map(c => c.data);
        const finalBuffer = Buffer.concat(bufferList);

        console.log(`[Finalize] Total size reconstructed: ${finalBuffer.length} bytes`);

        const id = uuidv4();
        const isVideo = mime_type.startsWith('video/');
        const isImage = mime_type.startsWith('image/');
        const tipo = isVideo ? 'video' : (isImage ? 'foto' : (mime_type === 'application/pdf' ? 'pdf' : 'archivo'));

        // Insert into main table
        await mediaDb.execute(
            `INSERT INTO galerias_pacientes (id, cedula_paciente, ficha_id, modulo, nombre, tipo, categoria, data, mime_type, size) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, cedula, ficha_id || null, modulo || 'odontologia', nombre, tipo, categoria || 'General', finalBuffer, mime_type, finalBuffer.length]
        );

        // Cleanup chunks
        await mediaDb.execute('DELETE FROM media_upload_chunks WHERE upload_id = ?', [uploadId]);

        return NextResponse.json({
            message: 'Carga finalizada con éxito',
            id,
            media: {
                id,
                cedula_paciente: cedula,
                nombre,
                tipo,
                mime_type,
                size: finalBuffer.length,
                created_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[Finalize Error]:', error);
        return NextResponse.json({ error: 'Error al reconstruir el archivo', detail: error.message }, { status: 500 });
    }
}
