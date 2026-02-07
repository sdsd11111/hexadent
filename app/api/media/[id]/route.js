import { NextResponse } from 'next/server';
import mediaDb from '@/lib/media-db';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const range = request.headers.get('range');

        const [rows] = await mediaDb.execute(
            'SELECT data, mime_type, size FROM galerias_pacientes WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return new Response('Media not found', { status: 404 });
        }

        const media = rows[0];
        const fullData = media.data;
        const totalSize = media.size || fullData.length;

        if (range && media.mime_type.startsWith('video/')) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

            if (start >= totalSize) {
                return new Response('Requested range not satisfiable', {
                    status: 416,
                    headers: { 'Content-Range': `bytes */${totalSize}` }
                });
            }

            const chunksize = (end - start) + 1;
            const chunk = fullData.subarray(start, end + 1);

            return new Response(chunk, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': media.mime_type,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                },
            });
        }

        return new Response(fullData, {
            headers: {
                'Content-Type': media.mime_type,
                'Content-Length': totalSize,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving media binary:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
