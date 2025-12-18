import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { telegram_id, product_id } = body;

        if (!telegram_id || !product_id) {
            return NextResponse.json({ error: 'Missing telegram_id or product_id' }, { status: 400 });
        }

        await query(
            `INSERT INTO favorites (telegram_id, product_id) VALUES ($1, $2) 
       ON CONFLICT (telegram_id, product_id) DO NOTHING`,
            [telegram_id, product_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Favorites POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const telegram_id = searchParams.get('telegram_id');
        const product_id = searchParams.get('product_id');

        if (!telegram_id || !product_id) {
            return NextResponse.json({ error: 'Missing params' }, { status: 400 });
        }

        await query(
            `DELETE FROM favorites WHERE telegram_id = $1 AND product_id = $2`,
            [telegram_id, product_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
