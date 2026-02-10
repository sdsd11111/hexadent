
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        version: "1.0.5",
        build_time: "2026-02-10 12:42",
        status: "LIVE_REINFORCED_METADATA_V1"
    });
}
