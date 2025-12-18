import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse filters
        const category = searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined;
        const search = searchParams.get('search') || undefined;
        const technology = searchParams.get('technology') || undefined;
        const format = searchParams.get('format') || undefined;
        const wifi = searchParams.has('wifi') ? searchParams.get('wifi') === 'true' : undefined;
        const color_print = searchParams.has('color') ? searchParams.get('color') === 'true' : undefined;
        const sort = searchParams.get('sort') as any;

        const products = await ProductService.getAll({
            category,
            search,
            technology,
            format,
            wifi,
            color_print,
            sort
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Products API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
