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
       brand=$1, model=$2, sku=$3, title_ru=$4, price=$5, status=$6,
       technology=$7, wifi=$8, duplex=$9, color_print=$10
       WHERE id = $11`,
            [
                body.brand, body.model, body.sku, body.title_ru, body.price, body.status,
                body.technology, body.wifi, body.duplex, body.color_print,
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
