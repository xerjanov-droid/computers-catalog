
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/admin/filters?subcategory_id=...
export async function GET(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategory_id');

    if (!subcategoryId) {
        return NextResponse.json({ error: 'Missing subcategory_id' }, { status: 400 });
    }

    try {
        const result = await query(
            `SELECT cf.*, c.name_ru as characteristic_name_ru, c.name_uz as characteristic_name_uz, c.name_en as characteristic_name_en, c.key as characteristic_key
       FROM category_filters cf
       LEFT JOIN characteristics c ON cf.characteristic_id = c.id
       WHERE cf.subcategory_id = $1
       ORDER BY cf.order_index ASC, cf.id ASC`,
            [subcategoryId]
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching filters:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/admin/filters
export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const {
            subcategory_id,
            characteristic_id,
            type,
            label_uz,
            label_ru,
            label_en,
            is_enabled,
            min_value,
            max_value,
            is_multiselect,
            source_type
        } = body;

        // Get max order index
        const countRes = await query('SELECT MAX(order_index) as max_order FROM category_filters WHERE subcategory_id = $1', [subcategory_id]);
        const nextOrder = (countRes.rows[0].max_order || 0) + 1;

        const result = await query(
            `INSERT INTO category_filters 
      (subcategory_id, characteristic_id, type, label_uz, label_ru, label_en, is_enabled, order_index, min_value, max_value, is_multiselect, source_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
            [
                subcategory_id,
                characteristic_id || null,
                type,
                label_uz || '',
                label_ru || '',
                label_en || '',
                is_enabled ?? true,
                nextOrder,
                min_value || null,
                max_value || null,
                is_multiselect || false,
                source_type || 'characteristic'
            ]
        );

        return NextResponse.json(result.rows[0]);
    } catch (err: any) {
        console.error('Error creating filter:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
