import { query } from '@/lib/db';
import { Category } from '@/types';

export class CategoryService {
    static async getAll(): Promise<Category[]> {
        const res = await query(
            `SELECT * FROM categories 
       WHERE is_active = true 
       ORDER BY order_index ASC`
        );
        return res.rows;
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

    static async getTree(): Promise<Category[]> {
        const all = await this.getAllAdmin();
        const categoryMap = new Map<number, Category>();

        // 1. Init map and parse counts
        all.forEach(c => {
            categoryMap.set(c.id, {
                ...c,
                children: [],
                product_count: parseInt(c.product_count as any) || 0,
                characteristic_count: parseInt(c.characteristic_count as any) || 0
            });
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

    static async getById(id: number): Promise<Category | null> {
        const res = await query('SELECT * FROM categories WHERE id = $1', [id]);
        return res.rows[0] || null;
    }

    static async update(id: number, data: Partial<Category>): Promise<Category> {
        const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'children' && k !== 'product_count');
        const values = fields.map(k => (data as any)[k]);

        if (fields.length === 0) return await this.getById(id) as Category;

        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

        const res = await query(
            `UPDATE categories SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return res.rows[0];
    }

    static async getCategoryCharacteristics(categoryId: number): Promise<any[]> {
        const res = await query(`
            SELECT cc.*, c.name_ru as name_ru, c.key, c.type
            FROM category_characteristics cc
            JOIN characteristics c ON cc.characteristic_id = c.id
            WHERE cc.category_id = $1
            ORDER BY cc.order_index ASC
        `, [categoryId]);
        return res.rows;
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
