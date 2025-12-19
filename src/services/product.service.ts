import { query } from '@/lib/db';
import { Product } from '@/types';

interface ProductFilters {
    category?: number;
    sub?: number;
    search?: string;
    technology?: string[];
    color?: string[];
    wifi?: boolean;
    format?: string;
    sort?: 'price_asc' | 'price_desc' | 'popular' | 'stock';
    availability?: string[];
    price_from?: number;
    price_to?: number;
}

export class ProductService {
    static async getAll(filters: ProductFilters): Promise<Product[]> {
        // Strict Category Hierarchy Logic
        // c1 = direct category of product
        // c2 = parent of c1 (if exists)
        let sql = `
      SELECT p.*, 
             COALESCE(c2.name_en, c1.name_en) as category_name,
             COALESCE(c2.slug, c1.slug) as category_slug,
             CASE WHEN c2.id IS NOT NULL THEN c1.slug ELSE NULL END as subcategory_slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY order_index ASC LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c1 ON p.category_id = c1.id
      LEFT JOIN categories c2 ON c1.parent_id = c2.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.price_from) {
            sql += ` AND p.price >= $${paramIndex++}`;
            params.push(filters.price_from);
        }

        if (filters.price_to) {
            sql += ` AND p.price <= $${paramIndex++}`;
            params.push(filters.price_to);
        }

        if (filters.availability && filters.availability.length > 0) {
            // Handle legacy 'pre_order' status mapping to 'on_order'
            const statusValues = [...filters.availability];
            if (statusValues.includes('on_order') && !statusValues.includes('pre_order')) {
                statusValues.push('pre_order');
            }

            sql += ` AND p.status = ANY($${paramIndex++}::text[])`;
            params.push(statusValues);
        }

        if (filters.sub) {
            // Precise subcategory match
            sql += ` AND p.category_id = $${paramIndex++}`;
            params.push(filters.sub);
        } else if (filters.category) {
            // Category match (includes subcategories)
            // If filtering by ID, we need to check if product is in this category directly (if main) 
            // OR if product is in a child of this category
            sql += ` AND (p.category_id = $${paramIndex} OR p.category_id IN (SELECT id FROM categories WHERE parent_id = $${paramIndex}))`;
            params.push(filters.category);
            paramIndex++;
        }

        // Technology: Multi-select using ANY
        if (filters.technology && filters.technology.length > 0) {
            sql += ` AND p.technology = ANY($${paramIndex++}::text[])`;
            params.push(filters.technology);
        }

        if (filters.format) {
            sql += ` AND p.format = $${paramIndex++}`;
            params.push(filters.format);
        }

        // Wifi: Boolean check
        if (filters.wifi === true) {
            sql += ` AND p.wifi = true`;
        }

        // Color Logic: strict per TZ
        // color=["color"] -> color_print = true
        // color=["bw"] -> color_print = false
        // color=["color", "bw"] -> logic skipped (show all)
        if (filters.color && filters.color.length === 1) {
            const val = filters.color[0];
            if (val === 'color') {
                sql += ` AND p.color_print = true`;
            } else if (val === 'bw') {
                sql += ` AND p.color_print = false`;
            }
        }

        // Sort
        if (filters.sort === 'price_asc') {
            sql += ` ORDER BY p.price ASC`;
        } else if (filters.sort === 'price_desc') {
            sql += ` ORDER BY p.price DESC`;
        } else if (filters.sort === 'stock') {
            sql += ` ORDER BY CASE WHEN p.status = 'in_stock' THEN 1 ELSE 2 END ASC, p.id DESC`;
            // ... existing sort logic
        } else {
            sql += ` ORDER BY p.id DESC`;
        }

        const res = await query(sql, params);
        return res.rows;
    }

    static async getById(id: number): Promise<Product | null> {
        // Get product and related data with strict hierarchy
        const pRes = await query(`
      SELECT p.*, 
             COALESCE(c2.name_ru, c1.name_ru) as category_name_ru,
             COALESCE(c2.slug, c1.slug) as category_slug,
             CASE WHEN c2.id IS NOT NULL THEN c1.slug ELSE NULL END as subcategory_slug
      FROM products p
      LEFT JOIN categories c1 ON p.category_id = c1.id
      LEFT JOIN categories c2 ON c1.parent_id = c2.id
      WHERE p.id = $1
    `, [id]);

        if (pRes.rows.length === 0) return null;

        const product = pRes.rows[0];

        // Fetch images
        const imgRes = await query('SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY order_index', [id]);
        product.images = imgRes.rows.map(r => r.image_url);

        const fileRes = await query('SELECT * FROM product_files WHERE product_id = $1', [id]);
        product.files = fileRes.rows;

        // Increment views (fire and forget)
        query('UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id])
            .catch(err => console.error('View increment error', err));

        return product;
    }
}
