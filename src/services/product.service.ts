import { query } from '@/lib/db';
import { Product } from '@/types';

interface ProductFilters {
    category?: number;
    sub?: number;
    search?: string;
    technology?: string;
    wifi?: boolean;
    color_print?: boolean;
    format?: string;
    sort?: 'price_asc' | 'price_desc' | 'popular' | 'stock';
}

export class ProductService {
    static async getAll(filters: ProductFilters): Promise<Product[]> {
        let sql = `
      SELECT p.*, c.name_en as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY order_index ASC LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.sub) {
            sql += ` AND p.category_id = $${paramIndex++}`;
            params.push(filters.sub);
        } else if (filters.category) {
            // Main category selected: show products from main OR its children
            // Assuming products might be linked to Child directly.
            // "SELECT id FROM categories WHERE parent_id = ?" fetches all children.
            sql += ` AND (p.category_id = $${paramIndex} OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${paramIndex}))`;
            params.push(filters.category);
            paramIndex++;
        }

        if (filters.technology) {
            sql += ` AND p.technology = $${paramIndex++}`;
            params.push(filters.technology);
        }

        if (filters.format) {
            sql += ` AND p.format = $${paramIndex++}`;
            params.push(filters.format);
        }

        if (filters.wifi !== undefined) {
            sql += ` AND p.wifi = $${paramIndex++}`;
            params.push(filters.wifi);
        }

        if (filters.color_print !== undefined) {
            sql += ` AND p.color_print = $${paramIndex++}`;
            params.push(filters.color_print);
        }

        if (filters.search) {
            sql += ` AND (p.title_ru ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.model ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        // Sort
        if (filters.sort === 'price_asc') {
            sql += ` ORDER BY p.price ASC`;
        } else if (filters.sort === 'price_desc') {
            sql += ` ORDER BY p.price DESC`;
        } else if (filters.sort === 'stock') {
            // Logic for stock: in_stock first?
            sql += ` ORDER BY CASE WHEN p.status = 'in_stock' THEN 1 ELSE 2 END ASC, p.id DESC`;
        } else {
            sql += ` ORDER BY p.id DESC`; // Default
        }

        const res = await query(sql, params);
        return res.rows;
    }

    static async getById(id: number): Promise<Product | null> {
        // Get product and related data
        const pRes = await query(`
      SELECT p.*, c.name_ru as category_name_ru
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [id]);

        if (pRes.rows.length === 0) return null;

        const product = pRes.rows[0];

        // Fetch images and specs
        const imgRes = await query('SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY order_index', [id]);
        product.images = imgRes.rows.map(r => r.image_url);

        const specRes = await query('SELECT * FROM product_specs WHERE product_id = $1', [id]);
        product.specs = specRes.rows;

        const fileRes = await query('SELECT * FROM product_files WHERE product_id = $1', [id]);
        product.files = fileRes.rows;

        // Increment views (fire and forget)
        query('UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id])
            .catch(err => console.error('View increment error', err));

        return product;
    }
}
