
import { NextResponse } from 'next/server';
import { CharacteristicService } from '@/services/characteristic.service';

export async function GET() {
    try {
        const data = await CharacteristicService.getAll();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = await CharacteristicService.create(body);
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
