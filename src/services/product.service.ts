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
    excludeInactive?: boolean;
    lang?: 'ru' | 'uz' | 'en';
}

export class ProductService {
    static async getAll(filters: ProductFilters): Promise<Product[]> {
        // Strict Category Hierarchy Logic
        // c1 = direct category of product
        // c2 = parent of c1 (if exists)
        let sql = `
          SELECT p.*, 
              -- Provide category names in all supported languages so callers (SSR/API) can pick appropriate one
              COALESCE(c2.name_en, c1.name_en) as category_name_en,
              COALESCE(c2.name_ru, c1.name_ru) as category_name_ru,
              COALESCE(c2.name_uz, c1.name_uz) as category_name_uz,
              COALESCE(c2.slug, c1.slug) as category_slug,
             CASE WHEN c2.id IS NOT NULL THEN c1.slug ELSE NULL END as subcategory_slug,
             (SELECT image_url FROM products_images WHERE product_id = p.id AND is_cover = TRUE LIMIT 1) as main_image
      FROM products p
      LEFT JOIN categories c1 ON p.category_id = c1.id
      LEFT JOIN categories c2 ON c1.parent_id = c2.id
      WHERE 1=1
    `;
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.excludeInactive) {
            // Direct category must be active AND Parent (if exists) must be active
            sql += ` AND c1.is_active = true AND (c2.id IS NULL OR c2.is_active = true)`;
        }

        if (filters.search) {
            const searchParam = `%${filters.search}%`;
            sql += ` AND (p.title_ru ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`;
            params.push(searchParam);
            paramIndex++;
        }

        if (filters.price_from) {
            sql += ` AND p.price >= $${paramIndex++}`;
            params.push(filters.price_from);
        }

        if (filters.price_to) {
            sql += ` AND p.price <= $${paramIndex++}`;
            params.push(filters.price_to);
        }

        if (filters.availability && filters.availability.length > 0) {
            const statusValues = filters.availability;
            sql += ` AND p.status = ANY($${paramIndex++}::text[])`;
            params.push(statusValues);
        } else if (!filters.excludeInactive) {
            // Public API default: Show only active statuses (exclude archived)
            // excludeInactive=true logic is for admin to show specific things? 
            // Actually, filters.excludeInactive logic in original code was: "Direct category must be active..."
            // We need a way to distinguish Admin (show all) vs Public (hide archived).
            // Usually, Admin passes availability=['in_stock', 'pre_order', 'showroom', 'archived'] or separate flag?
            // If filters.availability is empty, we assume Public default? 
            // BUT Admin might want to see ALL including archived.
            // Let's rely on the caller passing 'archived' if they want it.
            // If caller is Public, they won't ask for 'archived'.
            // BUT if caller passes NOTHING, we should default to Active Only for public?
            // The method signature doesn't imply "AdminByDeault".
            // Let's assume if no availability filter is passed, we show everything EXCEPT archived by default?
            // The TT says: "Public API... archived HECH QACHON... WHERE status IN ('in_stock', 'pre_order', 'showroom')"

            // To be safe, we will add a default exclusion of 'archived' unless explicit availability list contains it?
            // OR simpler: The calling code for Public API should set availability=['in_stock', 'pre_order', 'showroom'].
            // However, existing calls might not set it.

            // We'll enforce: If availability is NOT provided, show ('in_stock', 'pre_order', 'showroom').
            // If availability IS provided, use it (Admin can ask for 'archived').

            sql += ` AND p.status IN ('in_stock', 'pre_order', 'showroom')`;
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
        return res.rows.map((row: any) => ({
            ...row,
            // Provide a single localized category_name when `lang` requested
            category_name: filters.lang ? (row[`category_name_${filters.lang}`] || row.category_name_ru || row.category_name_en || row.category_name_uz) : undefined,
            // Provide a single localized title when `lang` requested
            title: filters.lang ? (row[`title_${filters.lang}`] || row.title_ru || row.title_en || row.title_uz) : undefined,
            images: row.main_image ? [{ id: 0, image_url: row.main_image, is_cover: true }] : []
        }));
    }

    static async getById(id: number, lang?: 'ru' | 'uz' | 'en'): Promise<Product | null> {
        // Get product and related data with strict hierarchy
        const pRes = await query(`
          SELECT p.*, 
              COALESCE(c2.name_en, c1.name_en) as category_name_en,
              COALESCE(c2.name_ru, c1.name_ru) as category_name_ru,
              COALESCE(c2.name_uz, c1.name_uz) as category_name_uz,
              COALESCE(c2.slug, c1.slug) as category_slug,
             CASE WHEN c2.id IS NOT NULL THEN c1.slug ELSE NULL END as subcategory_slug,
             CASE WHEN c1.parent_id IS NOT NULL THEN c1.parent_id ELSE c1.id END as main_category_id,
             CASE WHEN c1.parent_id IS NOT NULL THEN c1.id ELSE NULL END as sub_category_id
      FROM products p
      LEFT JOIN categories c1 ON p.category_id = c1.id
      LEFT JOIN categories c2 ON c1.parent_id = c2.id
      WHERE p.id = $1
    `, [id]);

        if (pRes.rows.length === 0) return null;

        const product = pRes.rows[0];
        // If caller provided a language, they may want a unified `title` field.
        // We don't have access to a passed `lang` here unless we add a parameter — add optional lang param.

        // Fetch images
        const imgRes = await query('SELECT id, image_url, is_cover FROM products_images WHERE product_id = $1 ORDER BY order_index, id', [id]);
        product.images = imgRes.rows;

        const fileRes = await query('SELECT * FROM product_files WHERE product_id = $1', [id]);
        product.files = fileRes.rows;

        // Increment views (fire and forget)
        query('UPDATE products SET views = COALESCE(views, 0) + 1 WHERE id = $1', [id])
            .catch(err => console.error('View increment error', err));

        if (lang) {
            product.title = product[`title_${lang}`] || product.title_ru || product.title_en || product.title_uz;
            // Provide localized category_name as well
            product.category_name = product[`category_name_${lang}`] || product.category_name_en || product.category_name_ru || product.category_name_uz;
        }

        return product;
    }
    static async update(id: number, data: Partial<Product>): Promise<Product> {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        // ... generic update logic similar to characteristics ...
        Object.entries(data).forEach(([key, value]) => {
            if (key !== 'id' && value !== undefined) {
                fields.push(`${key}=$${idx++}`);
                values.push(value);
            }
        });
        values.push(id);

        const res = await query(`UPDATE products SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`, values);
        return res.rows[0];
    }

    static async bulkUpdateStatus(ids: number[], status: string) {
        if (ids.length === 0) return;
        await query(`UPDATE products SET status = $1 WHERE id = ANY($2)`, [status, ids]);
    }

    static async bulkDelete(ids: number[]) {
        if (ids.length === 0) return;
        await query(`DELETE FROM products WHERE id = ANY($1)`, [ids]);
    }

    static async duplicate(id: number): Promise<Product> {
        const original = await this.getById(id);
        if (!original) throw new Error("Product not found");

        const newName = `${original.title_ru} (Copy)`; // Simplified naming

        const res = await query(`
            INSERT INTO products (
                category_id, brand_id, name_ru, name_uz, name_en, 
                description_ru, description_uz, description_en, 
                price, old_price, status, specs, key_features
            )
            SELECT 
                category_id, brand_id, $1, name_uz, name_en, 
                description_ru, description_uz, description_en, 
                price, old_price, 'draft', specs, key_features
            FROM products WHERE id = $2
            RETURNING *
        `, [newName, id]);

        return res.rows[0];
    }
}
