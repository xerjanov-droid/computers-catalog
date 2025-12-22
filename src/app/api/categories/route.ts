import { NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const lang = (cookieStore.get('active_lang')?.value as 'ru' | 'uz' | 'en') || 'uz';
        const categories = await CategoryService.getAll(lang);
        // Return categories with a unified `name` field for client convenience
        return NextResponse.json(categories);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
