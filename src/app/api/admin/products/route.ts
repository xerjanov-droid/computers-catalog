import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Validate body using Zod in real app

        // Simple Insert
        const res = await query(
            `INSERT INTO products 
       (brand, model, sku, title_ru, price, currency, status, technology, wifi, duplex, color_print)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
            [
                body.brand, body.model, body.sku, body.title_ru,
                body.price, body.currency, body.status,
                body.technology, body.wifi, body.duplex, body.color_print
            ]
        );

        logger.info('Product created', { id: res.rows[0].id, user: 'admin' });

        return NextResponse.json({ id: res.rows[0].id });
    } catch (error) {
        logger.error('Create product failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
