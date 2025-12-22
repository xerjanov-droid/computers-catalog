
import { query } from '@/lib/db';

export class RoleService {
    static async getAll() {
        const res = await query(`
            SELECT r.*, COUNT(u.id)::int as user_count 
            FROM roles r
            LEFT JOIN users u ON u.role_id = r.id
            GROUP BY r.id
            ORDER BY r.id
        `);
        return res.rows;
    }

    static async getById(id: number) {
        const res = await query(`SELECT * FROM roles WHERE id = $1`, [id]);
        return res.rows[0];
    }

    static async updatePermissions(id: number, permissions: any) {
        // Prevent modifying Super Admin permissions if needed, but UI should handle it too.
        // We'll trust the controller to check slug vs 'super_admin' if strictly required.
        const res = await query(
            `UPDATE roles SET permissions = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [permissions, id]
        );
        return res.rows[0];
    }
}
