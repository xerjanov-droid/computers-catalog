import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse filters
        const category = searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined;
        const search = searchParams.get('search') || undefined;
        const technologyParam = searchParams.get('technology');
        const technology = technologyParam ? technologyParam.split(',').filter(Boolean) : undefined;

        const format = searchParams.get('format') || undefined;
        const wifi = searchParams.has('wifi') ? searchParams.get('wifi') === 'true' : undefined;
        const color_print = searchParams.has('color') ? searchParams.get('color') === 'true' : undefined;
        const availabilityParam = searchParams.get('availability');
        const availability = availabilityParam ? availabilityParam.split(',').filter(Boolean) : undefined;

        const priceFromParam = searchParams.get('price_from');
        const priceToParam = searchParams.get('price_to');
        const price_from = priceFromParam ? parseInt(priceFromParam) : undefined;
        const price_to = priceToParam ? parseInt(priceToParam) : undefined;

        const sort = searchParams.get('sort') as "price_asc" | "price_desc" | "popular" | "stock" | undefined;

        const cookieLang = request.cookies.get('active_lang')?.value as 'ru' | 'uz' | 'en' | undefined;

        const products = await ProductService.getAll({
            category,
            search,
            technology,
            format,
            wifi,
            // color_print, // Logic moved to 'color' array in service, disabling legacy boolean param
            sort,
            availability,
            price_from,
            price_to,
            excludeInactive: true,
            lang: cookieLang
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Products API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
