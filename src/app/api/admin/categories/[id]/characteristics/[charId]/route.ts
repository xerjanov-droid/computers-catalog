
import { NextResponse } from 'next/server';
import { CharacteristicService } from '@/services/characteristic.service';

// DELETE: Remove linkage (unlink)
export async function DELETE(req: Request, props: { params: Promise<{ id: string, charId: string }> }) {
    try {
        const params = await props.params;
        const categoryId = parseInt(params.id);
        const charId = parseInt(params.charId);
        await CharacteristicService.removeFromCategory(categoryId, charId);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

// PUT: Update link config (required, sort, etc)
export async function PUT(req: Request, props: { params: Promise<{ id: string, charId: string }> }) {
    try {
        const params = await props.params;
        const categoryId = parseInt(params.id);
        const charId = parseInt(params.charId);
        const body = await req.json();

        await CharacteristicService.updateCategoryLink(categoryId, charId, body);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
