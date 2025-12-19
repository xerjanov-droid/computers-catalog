import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        await query(
            `UPDATE categories SET 
       parent_id=$1, name_ru=$2, name_uz=$3, name_en=$4, icon=$5, order_index=$6, is_active=$7
       WHERE id = $8`,
            [
                body.parent_id || null,
                body.name_ru,
                body.name_uz,
                body.name_en,
                body.icon,
                body.order_index,
                body.is_active,
                id
            ]
        );

        logger.info('Category updated', { id, user: 'admin' });
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Update category failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Optional: Check for child categories or products before delete
        // For now, strict foreign keys might fail, so we catch error

        await query('DELETE FROM categories WHERE id = $1', [id]);
        logger.info('Category deleted', { id });
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Delete category failed', error);
        return NextResponse.json({ error: 'Could not delete category (likely has products/subcategories)' }, { status: 400 });
    }
}
