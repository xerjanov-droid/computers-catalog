import { NextResponse } from 'next/server';
import { CategoryService } from '@/services/category.service';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        // Use cookie as single source of truth for language (do not default here)
        const lang = cookieStore.get('active_lang')?.value as 'ru' | 'uz' | 'en' | undefined;
        const categories = await CategoryService.getAll(lang);
        return NextResponse.json(categories);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
