
import { query } from '@/lib/db';
import { ProductService } from '@/services/product.service';
import { ProductsClient } from '@/components/admin/products/ProductsClient';

interface Props {
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductsPage({ searchParams }: Props) {
    // 1. Fetch Stats (guard `status` column presence)
    const prodStatusRes = await query(`
        SELECT EXISTS(
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'products' AND column_name = 'status'
        ) as has_status
    `);
    const hasProductStatus = !!prodStatusRes.rows[0]?.has_status;

    const statsRes = hasProductStatus
        ? await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN status = 'pre_order' THEN 1 ELSE 0 END) as pre_order,
                SUM(CASE WHEN status = 'showroom' THEN 1 ELSE 0 END) as showroom
            FROM products
        `)
        : await query(`
            SELECT COUNT(*) as total, 0 as in_stock, 0 as pre_order, 0 as showroom FROM products
        `);

    const stats = {
        total: parseInt(statsRes.rows[0].total) || 0,
        in_stock: parseInt(statsRes.rows[0].in_stock) || 0,
        pre_order: parseInt(statsRes.rows[0].pre_order) || 0,
        showroom: parseInt(statsRes.rows[0].showroom) || 0
    };

    // 2. Fetch Categories
    const categories = (await query('SELECT id, name_ru, name_uz, name_en, parent_id FROM categories ORDER BY name_ru')).rows;

    return (
        <ProductsClient
            stats={stats}
            categories={categories}
        />
    );
}
