
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CharacteristicService } from '@/services/characteristic.service';

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

        // Read cookie-only for language (service will centralize fallback)
        const cookieStore = await cookies();
        const cookieLang = cookieStore.get('active_lang')?.value as 'ru' | 'uz' | 'en' | undefined;

        const data = await CharacteristicService.getByCategoryId(cid, cookieLang);

        return NextResponse.json({
            data,
            canCopyFrom: true
        });

    } catch (error) {
        console.error('Fetch characteristics error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
