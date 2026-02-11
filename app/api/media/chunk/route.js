
import { NextResponse } from 'next/server';
import mediaDb from '@/lib/media-db';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const uploadId = formData.get('upload_id');
        const chunkIndex = parseInt(formData.get('chunk_index'));
        const file = formData.get('file');

        if (!uploadId || isNaN(chunkIndex) || !file) {
            return NextResponse.json({ error: 'Faltan datos del fragmento' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        await mediaDb.execute(
            'INSERT INTO media_upload_chunks (upload_id, chunk_index, data) VALUES (?, ?, ?)',
            [uploadId, chunkIndex, buffer]
        );

        return NextResponse.json({ message: 'Fragmento recibido', index: chunkIndex });
    } catch (error) {
        console.error('[Chunk Upload Error]:', error);
        return NextResponse.json({ error: 'Error al procesar fragmento', detail: error.message }, { status: 500 });
    }
}
