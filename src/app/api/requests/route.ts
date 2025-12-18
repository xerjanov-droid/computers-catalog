import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { B2BRequest } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body: Partial<B2BRequest> = await request.json();
        const { telegram_id, type, message } = body;

        if (!telegram_id || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const res = await query(
            `INSERT INTO b2b_requests (telegram_id, type, message) VALUES ($1, $2, $3) RETURNING id`,
            [telegram_id, type, message || '']
        );

        // TODO: Notify Admin via Telegram Bot (if token available)

        return NextResponse.json({ success: true, id: res.rows[0].id });
    } catch (error) {
        console.error('Requests API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
