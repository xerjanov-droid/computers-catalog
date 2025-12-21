
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const targetId = parseInt(params.id);
        if (isNaN(targetId)) {
            return NextResponse.json({ error: 'Invalid Category ID' }, { status: 400 });
        }

        const body = await request.json();
        const { sourceCategoryId } = body;

        if (!sourceCategoryId) {
            return NextResponse.json({ error: 'Source Category ID is required' }, { status: 400 });
        }

        // Copy characteristics from source to target
        // We use ON CONFLICT DO NOTHING to avoid duplicate key errors if some characteristics are already linked
        const sql = `
            INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
            SELECT $1, characteristic_id, is_required, show_in_key_specs, order_index
            FROM category_characteristics
            WHERE category_id = $2
            ON CONFLICT (category_id, characteristic_id) DO NOTHING
        `;

        await query(sql, [targetId, sourceCategoryId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error copying characteristics:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
