
import { NextResponse } from 'next/server';
import { CharacteristicService } from '@/services/characteristic.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sourceSubcategoryId, targetSubcategoryId } = body;

        if (!sourceSubcategoryId || !targetSubcategoryId) {
            return NextResponse.json(
                { error: 'Source and Target Subcategory IDs are required' },
                { status: 400 }
            );
        }

        await CharacteristicService.copyCharacteristics(
            Number(sourceSubcategoryId),
            Number(targetSubcategoryId)
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('API Error /characteristics/copy:', e);
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
