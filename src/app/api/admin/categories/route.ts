import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name_ru || !body.order_index) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const res = await query(
            `INSERT INTO categories 
       (parent_id, name_ru, name_uz, name_en, icon, order_index, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
            [
                body.parent_id || null,
                body.name_ru,
                body.name_uz || body.name_ru, // Fallback
                body.name_en || body.name_ru, // Fallback
                body.icon || null,
                body.order_index,
                body.is_active ?? true
            ]
        );

        logger.info('Category created', { id: res.rows[0].id, user: 'admin' });

        return NextResponse.json({ id: res.rows[0].id });
    } catch (error) {
        logger.error('Create category failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
