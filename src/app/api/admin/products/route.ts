import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ProductService } from '@/services/product.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const filters = {
            search: searchParams.get('search') || undefined,
            category: searchParams.get('category_id') && searchParams.get('category_id') !== 'all'
                ? parseInt(searchParams.get('category_id')!)
                : undefined,
            sub: searchParams.get('subcategory_id') && searchParams.get('subcategory_id') !== 'all'
                ? parseInt(searchParams.get('subcategory_id')!)
                : undefined,
            availability: searchParams.get('status') && searchParams.get('status') !== 'all'
                ? [searchParams.get('status')!]
                : undefined,
        };

        const products = await ProductService.getAll(filters);
        return NextResponse.json(products);
    } catch (error) {
        logger.error('Fetch products failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Validate body using Zod in real app

        // Simple Insert
        const res = await query(
            `INSERT INTO products 
       (category_id, brand, model, sku, title_ru, title_uz, title_en, price, currency, status, technology, wifi, duplex, color_print, is_price_visible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id`,
            [
                body.category_id, body.brand, body.model, body.sku,
                body.title_ru, body.title_uz, body.title_en,
                body.price, body.currency, body.status,
                body.technology, body.wifi, body.duplex, body.color_print,
                body.is_price_visible ?? true
            ]
        );

        logger.info('Product created', { id: res.rows[0].id, user: 'admin' });

        return NextResponse.json({ id: res.rows[0].id });
    } catch (error) {
        logger.error('Create product failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
