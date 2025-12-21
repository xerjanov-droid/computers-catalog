import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { logger } from '@/lib/logger';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);
        const body = await request.json();
        const { is_active } = body;

        if (isNaN(categoryId) || typeof is_active !== 'boolean') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const category = await CategoryService.toggleStatus(categoryId, is_active);

        logger.info('Category status updated', { categoryId, is_active, user: 'admin' });

        return NextResponse.json(category);
    } catch (error) {
        logger.error('Toggle category status failed', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
