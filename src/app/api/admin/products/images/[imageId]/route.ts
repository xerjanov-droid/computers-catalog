import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { storageService } from '@/lib/storage';
import { logger } from '@/lib/logger';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ imageId: string }> }
) {
    try {
        const { imageId } = await params;
        const id = parseInt(imageId);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
        }

        // Get image details before deleting
        const imageRes = await query('SELECT * FROM products_images WHERE id = $1', [id]);
        if (imageRes.rowCount === 0) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const image = imageRes.rows[0];

        // Delete from storage
        await storageService.delete(image.image_url);

        // Delete from DB
        await query('DELETE FROM products_images WHERE id = $1', [id]);

        // Handle Cover Deletion Fallback
        if (image.is_cover) {
            // Find the first available image and make it cover
            const nextImageRes = await query(
                'SELECT id FROM products_images WHERE product_id = $1 ORDER BY created_at ASC LIMIT 1',
                [image.product_id]
            );

            if ((nextImageRes?.rowCount ?? 0) > 0) {
                await query('UPDATE products_images SET is_cover = TRUE WHERE id = $1', [nextImageRes.rows[0].id]);
                logger.info('New cover set automatically', { productId: image.product_id, newCoverId: nextImageRes.rows[0].id, user: 'admin' });
            }
        }

        logger.info('Image deleted', { imageId: id, productId: image.product_id, user: 'admin' });

        return NextResponse.json({ success: true });

    } catch (error) {
        logger.error('Delete image failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
