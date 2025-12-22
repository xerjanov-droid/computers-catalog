
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const subcategoryId = searchParams.get('subcategoryId');

        if (!subcategoryId) {
            return NextResponse.json({ error: 'subcategoryId is required' }, { status: 400 });
        }

        const cid = parseInt(subcategoryId, 10);
        if (isNaN(cid)) {
            return NextResponse.json({ error: 'Invalid subcategoryId' }, { status: 400 });
        }

        // Fetch characteristics linked to this subcategory
        // We join with characteristics table to get details
        const res = await query(`
            SELECT 
                c.id,
                c.key as code,
                c.name_uz,
                c.name_ru,
                c.name_en,
                c.type as input_type,
                cc.is_required,
                cc.show_in_key_specs as is_spec,
                cc.order_index as "order"
            FROM category_characteristics cc
            JOIN characteristics c ON cc.characteristic_id = c.id
            WHERE cc.category_id = $1
            ORDER BY cc.order_index ASC
        `, [cid]);

        // "canCopyFrom" logic: 
        // If the list is empty, we return true (or based on some other business logic).
        // The TT says:
        /*
        Agar bo‘sh bo‘lsa — UIga signal qaytarsin
        {
          "data": [],
          "canCopyFrom": true
        }
        */
        const data = res.rows.map(row => ({
            id: row.id,
            code: row.code,
            label: {
                uz: row.name_uz,
                ru: row.name_ru,
                en: row.name_en
            },
            inputType: row.input_type || 'text', // Fallback
            isRequired: row.is_required,
            isSpec: row.is_spec,
            order: row.order
        }));

        return NextResponse.json({
            data,
            canCopyFrom: true
        });

    } catch (error) {
        console.error('Fetch characteristics error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
