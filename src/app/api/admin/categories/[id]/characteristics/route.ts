
import { NextResponse } from 'next/server';
import { CharacteristicService } from '@/services/characteristic.service';

// GET: List characteristics for a category
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const categoryId = parseInt(params.id);
        const data = await CharacteristicService.getByCategoryId(categoryId);
        return NextResponse.json(data);
    } catch (e) {
        console.error('API Error /categories/[id]/characteristics:', e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// POST: Assign a characteristic to a category
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const categoryId = parseInt(params.id);
        const body = await req.json();
        const { characteristic_id, is_required, show_in_key_specs, order_index } = body;

        await CharacteristicService.assignToCategory(categoryId, characteristic_id, {
            is_required,
            show_in_key_specs,
            order_index
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
