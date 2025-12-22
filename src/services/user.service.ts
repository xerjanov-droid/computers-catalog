
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export class UserService {
    static async getAll(filters: { search?: string, status?: string, role_id?: string } = {}) {
        let sql = `
            SELECT u.id, u.full_name, u.email, u.status, u.last_login, u.created_at, 
                   r.name as role_name, r.slug as role_slug, r.id as role_id
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let pIdx = 1;

        if (filters.search) {
            sql += ` AND (u.full_name ILIKE $${pIdx} OR u.email ILIKE $${pIdx})`;
            params.push(`%${filters.search}%`);
            pIdx++;
        }
        if (filters.status && filters.status !== 'all') {
            sql += ` AND u.status = $${pIdx}`;
            params.push(filters.status);
            pIdx++;
        }
        if (filters.role_id && filters.role_id !== 'all') {
            sql += ` AND u.role_id = $${pIdx}`;
            params.push(filters.role_id);
            pIdx++;
        }

        sql += ` ORDER BY u.id DESC`;

        const res = await query(sql, params);
        return res.rows;
    }

    static async getById(id: number) {
        const res = await query(`
            SELECT u.id, u.full_name, u.email, u.status, u.role_id, u.created_at, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
        `, [id]);
        return res.rows[0];
    }

    static async create(data: any) {
        // Hash password
        const hashedPassword = await hashPassword(data.password);

        const res = await query(
            `INSERT INTO users (full_name, email, password_hash, role_id, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, full_name, email`,
            [data.full_name, data.email, hashedPassword, data.role_id, data.status || 'active']
        );
        return res.rows[0];
    }

    static async update(id: number, data: any) {
        // Build dynamic update query
        const fields = [];
        const params = [];
        let pIdx = 1;

        if (data.full_name) {
            fields.push(`full_name = $${pIdx++}`);
            params.push(data.full_name);
        }
        if (data.email) {
            fields.push(`email = $${pIdx++}`);
            params.push(data.email);
        }
        if (data.role_id) {
            fields.push(`role_id = $${pIdx++}`);
            params.push(data.role_id);
        }
        if (data.status) {
            fields.push(`status = $${pIdx++}`);
            params.push(data.status);
        }
        if (data.password) {
            const hashedPassword = await hashPassword(data.password);
            fields.push(`password_hash = $${pIdx++}`);
            params.push(hashedPassword);
        }

        if (fields.length === 0) return null;

        params.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${pIdx} RETURNING id`;

        const res = await query(sql, params);
        return res.rows[0];
    }

    // Check if user exists (for validation)
    static async findByEmail(email: string) {
        const res = await query('SELECT id FROM users WHERE email = $1', [email]);
        return res.rows[0];
    }
}
