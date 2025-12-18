import { NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';

export async function GET() {
    try {
        const categories = await CategoryService.getAll();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
