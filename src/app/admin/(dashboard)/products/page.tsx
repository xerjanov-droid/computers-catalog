
import { query } from '@/lib/db';
import { ProductService } from '@/services/product.service';
import { ProductsClient } from '@/components/admin/products/ProductsClient';

export default async function ProductsPage() {
    // 1. Fetch Stats
    // Using raw query for speed
    const statsRes = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
            SUM(CASE WHEN status = 'pre_order' THEN 1 ELSE 0 END) as pre_order,
            SUM(CASE WHEN status = 'showroom' THEN 1 ELSE 0 END) as showroom
        FROM products
    `);

    const stats = {
        total: parseInt(statsRes.rows[0].total) || 0,
        in_stock: parseInt(statsRes.rows[0].in_stock) || 0,
        pre_order: parseInt(statsRes.rows[0].pre_order) || 0,
        showroom: parseInt(statsRes.rows[0].showroom) || 0
    };

    // 2. Fetch Products (Initial Page)
    // We'll pass all for now, assuming pagination later
    const products = await ProductService.getAll({});
    const categories = (await query('SELECT id, name_ru FROM categories')).rows;

    return (
        <ProductsClient
            initialProducts={products}
            stats={stats}
            categories={categories}
        />
    );
}
