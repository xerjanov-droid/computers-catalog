import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In App Router GET/PUT/etc recieve params as second arg
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Simple Update
        await query(
            `UPDATE products SET 
       category_id=$1, brand=$2, model=$3, sku=$4, title_ru=$5, title_uz=$6, title_en=$7, price=$8, status=$9,
       technology=$10, wifi=$11, duplex=$12, color_print=$13, is_price_visible=$14
       WHERE id = $15`,
            [
                body.category_id, body.brand, body.model, body.sku,
                body.title_ru, body.title_uz, body.title_en,
                body.price, body.status,
                body.technology, body.wifi, body.duplex, body.color_print,
                body.is_price_visible ?? true,
                id
            ]
        );

        logger.info('Product updated', { id, user: 'admin' });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Update product failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    logger.info('Product deleted', { id });
    return NextResponse.json({ success: true });
}
