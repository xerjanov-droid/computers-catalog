import { query } from '@/lib/db';
import { Category } from '@/types';
import { resolveLang, Lang } from './locale.service';

export class CategoryService {
    static async getAll(lang?: Lang): Promise<Category[]> {
        const res = await query(
            `SELECT * FROM categories 
       WHERE is_active = true 
       ORDER BY order_index ASC`
        );
        const currentLang = resolveLang(lang);
        return res.rows.map((r: {
            id: number;
            parent_id: number | null;
            slug: string;
            name_ru: string;
            name_uz: string;
            name_en: string;
            icon?: string;
            order_index: number;
            is_active: boolean;
        }): Category => {
            const resolvedName = r[`name_${currentLang}` as keyof typeof r] as string || r.name_ru || '';
            return {
                id: r.id,
                parent_id: r.parent_id,
                slug: r.slug,
                name: resolvedName, // Only resolved name for UI
                name_ru: r.name_ru,
                name_uz: r.name_uz,
                name_en: r.name_en,
                icon: r.icon,
                order_index: r.order_index,
                is_active: r.is_active
            };
        });
    }

    static async getAllAdmin(): Promise<Category[]> {
        const res = await query(
            `SELECT 
                c.*,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
                (SELECT COUNT(*) FROM category_characteristics cc WHERE cc.category_id = c.id) as characteristic_count
            FROM categories c 
            ORDER BY c.order_index ASC`
        );
        return res.rows;
    }

    static async getTree(lang?: 'ru' | 'uz' | 'en'): Promise<Category[]> {
        const all = await this.getAllAdmin();
        const categoryMap = new Map<number, Category>();

        // 1. Init map and parse counts
        const resolvedLang = resolveLang(lang);
        all.forEach(c => {
            // Resolve name based on language (Golden Rule: UI only sees 'name' field)
            const resolvedName = c[`name_${resolvedLang}` as keyof Category] as string || c.name_ru || '';
            
            const node: Category = {
                id: c.id,
                parent_id: c.parent_id,
                slug: c.slug,
                name: resolvedName, // Only resolved name for UI
                name_ru: c.name_ru, // Keep for admin panel use
                name_uz: c.name_uz,
                name_en: c.name_en,
                icon: c.icon,
                order_index: c.order_index,
                is_active: c.is_active,
                children: [],
                product_count: typeof c.product_count === 'number' ? c.product_count : parseInt(String(c.product_count || '0')) || 0,
                characteristic_count: typeof c.characteristic_count === 'number' ? c.characteristic_count : parseInt(String(c.characteristic_count || '0')) || 0
            };
            categoryMap.set(c.id, node);
        });

        const roots: Category[] = [];

        // 2. Build Hierarchy
        categoryMap.forEach(node => {
            if (node.parent_id && categoryMap.has(node.parent_id)) {
                categoryMap.get(node.parent_id)!.children!.push(node);
            } else {
                roots.push(node);
            }
        });

        // 3. Recursive Count Aggregation
        const calculateTotal = (node: Category): number => {
            let sum = node.product_count || 0; // Start with direct products
            if (node.children) {
                node.children.forEach(child => {
                    sum += calculateTotal(child);
                });
            }
            node.product_count = sum; // Update with total
            return sum;
        };

        roots.forEach(calculateTotal);

        return roots;
    }

    static async getById(id: number, lang?: 'ru' | 'uz' | 'en'): Promise<Category | null> {
        const res = await query('SELECT * FROM categories WHERE id = $1', [id]);
        const row = res.rows[0] || null;
        if (!row) return null;
        const resolvedLang = resolveLang(lang);
        const resolvedName = row[`name_${resolvedLang}` as keyof typeof row] as string || row.name_ru || '';
        return {
            id: row.id,
            parent_id: row.parent_id,
            slug: row.slug,
            name: resolvedName, // Only resolved name for UI
            name_ru: row.name_ru,
            name_uz: row.name_uz,
            name_en: row.name_en,
            icon: row.icon,
            order_index: row.order_index,
            is_active: row.is_active
        } as Category;
    }

    static async update(id: number, data: Partial<Category>): Promise<Category> {
        const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'children' && k !== 'product_count');
        const values = fields.map(k => (data as Record<string, unknown>)[k]);

        if (fields.length === 0) return await this.getById(id) as Category;

        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

        const res = await query(
            `UPDATE categories SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return res.rows[0];
    }

    static async getCategoryCharacteristics(categoryId: number, lang?: 'ru' | 'uz' | 'en'): Promise<any[]> {
        const res = await query(`
            SELECT cc.*, c.id as characteristic_id, c.key, c.name_ru, c.name_uz, c.name_en, c.type, cc.is_required, cc.show_in_key_specs, cc.order_index
            FROM category_characteristics cc
            JOIN characteristics c ON cc.characteristic_id = c.id
            WHERE cc.category_id = $1
            ORDER BY cc.order_index ASC
        `, [categoryId]);
        const resolvedLang = resolveLang(lang);
        return res.rows.map((r: any) => ({
            characteristic_id: r.characteristic_id,
            id: r.characteristic_id,
            name: r[`name_${resolvedLang}`] || r.name_ru,
            is_required: r.is_required,
            show_in_key_specs: r.show_in_key_specs,
            order_index: r.order_index
        }));
    }

    static async updateCategoryCharacteristics(
        categoryId: number,
        links: { characteristic_id: number; is_required: boolean; show_in_key_specs: boolean; order_index: number }[]
    ) {
        // Transaction could be better but simple batch for now
        await query('BEGIN');
        try {
            // Clear existing
            await query('DELETE FROM category_characteristics WHERE category_id = $1', [categoryId]);

            // Insert new
            for (const link of links) {
                await query(`
                    INSERT INTO category_characteristics 
                    (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
                    VALUES ($1, $2, $3, $4, $5)
                `, [
                    categoryId,
                    link.characteristic_id,
                    link.is_required,
                    link.show_in_key_specs,
                    link.order_index
                ]);
            }
            await query('COMMIT');
        } catch (e) {
            await query('ROLLBACK');
            throw e;
        }
    }
    static async toggleStatus(id: number, isActive: boolean): Promise<Category> {
        const res = await query(
            'UPDATE categories SET is_active = $1 WHERE id = $2 RETURNING *',
            [isActive, id]
        );
        return res.rows[0];
    }
}
