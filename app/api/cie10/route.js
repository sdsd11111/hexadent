import { NextResponse } from 'next/server';
import db from '@/lib/db';

async function ensureCieTableExists() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS cie10_custom (
            code VARCHAR(20) PRIMARY KEY,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `).catch(err => console.log('cie10_custom table error:', err.message));
}

export async function GET() {
    try {
        await ensureCieTableExists();
        const [rows] = await db.execute('SELECT code, title FROM cie10_custom ORDER BY created_at DESC');
        return NextResponse.json({ customCodes: rows });
    } catch (error) {
        console.error('Error fetching custom CIE10:', error);
        return NextResponse.json({ error: 'Error al obtener códigos CIE10 personalizados', details: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await ensureCieTableExists();
        const body = await request.json();
        const { code, title } = body;

        if (!code || !title) {
            return NextResponse.json({ error: 'Código y título son requeridos' }, { status: 400 });
        }

        await db.execute(
            'INSERT INTO cie10_custom (code, title) VALUES (?, ?) ON DUPLICATE KEY UPDATE title = VALUES(title)',
            [code.toUpperCase(), title.toUpperCase()]
        );

        return NextResponse.json({ message: 'Código CIE10 guardado exitosamente' }, { status: 201 });
    } catch (error) {
        console.error('Error saving custom CIE10:', error);
        return NextResponse.json({ error: 'Error al guardar código CIE10', details: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Código es requerido' }, { status: 400 });
        }

        await db.execute('DELETE FROM cie10_custom WHERE code = ?', [code]);
        return NextResponse.json({ message: 'Código CIE10 eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting custom CIE10:', error);
        return NextResponse.json({ error: 'Error al eliminar código CIE10', details: error.message }, { status: 500 });
    }
}
