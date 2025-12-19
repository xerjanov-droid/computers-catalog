import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ imageId: string }> }
) {
    try {
        const { imageId } = await params;
        const id = parseInt(imageId);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
        }

        // Check if image exists and get productId
        const imageRes = await query('SELECT product_id FROM products_images WHERE id = $1', [id]);
        if (imageRes.rowCount === 0) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }
        const productId = imageRes.rows[0].product_id;

        // Reset all covers for this product
        await query('UPDATE products_images SET is_cover = FALSE WHERE product_id = $1', [productId]);

        // Set the new cover
        await query('UPDATE products_images SET is_cover = TRUE WHERE id = $1', [id]);

        logger.info('Cover image updated', { productId, newCoverId: id, user: 'admin' });

        return NextResponse.json({ success: true });

    } catch (error) {
        logger.error('Set cover failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
