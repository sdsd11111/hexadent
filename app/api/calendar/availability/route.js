import { NextResponse } from 'next/server';
import { getAvailableSlots } from '../../../../lib/chatbot/scripts/calendar_helper.js';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    try {
        const slots = await getAvailableSlots(date);
        return NextResponse.json({ date, slots }, { status: 200 });
    } catch (error) {
        console.error('API Calendar Availability Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
