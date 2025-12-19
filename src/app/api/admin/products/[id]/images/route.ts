import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { storageService } from '@/lib/storage';
import { logger } from '@/lib/logger';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Improved Validation: Check for file instance and valid properties
        if (!(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: 'Invalid file object' }, { status: 400 });
        }


        // Validation: Size (3MB)
        if (file.size > 3 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 3MB' }, { status: 400 });
        }

        // Validation: Type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, jpeg, png, webp' }, { status: 400 });
        }

        // Save file
        const imageUrl = await storageService.save(file, `products/${productId}`);

        // Check if this is the first image for the product, if so make it cover
        const existingImages = await query('SELECT count(*) as count FROM products_images WHERE product_id = $1', [productId]);
        const isCover = parseInt(existingImages.rows[0].count) === 0;

        // Save db record
        const res = await query(
            `INSERT INTO products_images (product_id, image_url, is_cover) 
             VALUES ($1, $2, $3) 
             RETURNING id, image_url, is_cover`,
            [productId, imageUrl, isCover]
        );

        const newImage = res.rows[0];

        logger.info('Image uploaded', { productId, imageId: newImage.id, user: 'admin' });

        return NextResponse.json(newImage);

    } catch (error) {
        logger.error('Upload image failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
