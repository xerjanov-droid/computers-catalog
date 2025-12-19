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
            `SELECT * FROM categories 
       ORDER BY order_index ASC`
        );
        return res.rows;
    }

    static async getTree(): Promise<Category[]> {
        const all = await this.getAll();
        const roots = all.filter(c => !c.parent_id);
        const children = all.filter(c => c.parent_id);

        return roots.map(root => ({
            ...root,
            children: children.filter(c => c.parent_id === root.id)
        }));
    }

    static async getById(id: number): Promise<Category | null> {
        const res = await query('SELECT * FROM categories WHERE id = $1', [id]);
        return res.rows[0] || null;
    }
}
