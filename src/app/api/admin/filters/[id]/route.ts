
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        const body = await request.json();
        const {
            type,
            label_uz,
            label_ru,
            label_en,
            is_enabled,
            order_index,
            min_value,
            max_value,
            is_multiselect
        } = body;

        const result = await query(
            `UPDATE category_filters
       SET type = COALESCE($1, type),
           label_uz = COALESCE($2, label_uz),
           label_ru = COALESCE($3, label_ru),
           label_en = COALESCE($4, label_en),
           is_enabled = COALESCE($5, is_enabled),
           order_index = COALESCE($6, order_index),
           min_value = COALESCE($7, min_value),
           max_value = COALESCE($8, max_value),
           is_multiselect = COALESCE($9, is_multiselect),
           updated_at = now()
       WHERE id = $10
       RETURNING *`,
            [
                type,
                label_uz,
                label_ru,
                label_en,
                is_enabled,
                order_index,
                min_value,
                max_value,
                is_multiselect,
                id
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (err: any) {
        console.error('Error updating filter:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    try {
        await query('DELETE FROM category_filters WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting filter:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
