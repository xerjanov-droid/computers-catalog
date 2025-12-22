
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
        // Fetch:
        // 1. Characteristics linked to this subcategory (merged with their filter config if exists)
        // 2. Custom filters (not linked to characteristics)
        const result = await query(
            `
            SELECT
                f.id,
                c.id as characteristic_id,
                c.key as characteristic_key,
                c.name_ru as characteristic_name_ru,
                
                COALESCE(f.type, c.type) as type,
                
                COALESCE(f.label_ru, c.name_ru) as label_ru,
                COALESCE(f.label_uz, c.name_uz) as label_uz,
                COALESCE(f.label_en, c.name_en) as label_en,
                
                COALESCE(f.is_enabled, false) as is_enabled,
                COALESCE(f.order_index, cc.order_index) as order_index,
                
                COALESCE(f.source_type, 'characteristic') as source_type,
                (CASE WHEN f.id IS NOT NULL THEN true ELSE false END) as is_configured
            FROM characteristics c
            JOIN category_characteristics cc ON c.id = cc.characteristic_id
            LEFT JOIN category_filters f ON f.characteristic_id = c.id AND f.subcategory_id = $1
            WHERE cc.category_id = $1

            UNION ALL

            SELECT
                f.id,
                f.characteristic_id,
                NULL as characteristic_key,
                NULL as characteristic_name_ru,
                f.type,
                f.label_ru,
                f.label_uz,
                f.label_en,
                f.is_enabled,
                f.order_index,
                f.source_type,
                true as is_configured
            FROM category_filters f
            WHERE f.subcategory_id = $1 AND f.characteristic_id IS NULL

            ORDER BY order_index ASC, id ASC
            `,
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
