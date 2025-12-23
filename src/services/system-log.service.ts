import { query } from '@/lib/db';

export interface SystemLog {
    id: number;
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    context?: Record<string, any>;
    error_code?: string;
    user_id?: number;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}

export interface SystemLogFilters {
    level?: string[];
    start_date?: string;
    end_date?: string;
    user_id?: number;
    error_code?: string;
    limit?: number;
    offset?: number;
}

export class SystemLogService {
    static async create(log: Omit<SystemLog, 'id' | 'created_at'>): Promise<SystemLog> {
        const res = await query(
            `INSERT INTO system_logs (level, message, context, error_code, user_id, ip_address, user_agent)
             VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7)
             RETURNING *`,
            [
                log.level,
                log.message,
                JSON.stringify(log.context || {}),
                log.error_code,
                log.user_id,
                log.ip_address,
                log.user_agent
            ]
        );
        return res.rows[0];
    }

    static async getAll(filters: SystemLogFilters = {}): Promise<{ logs: SystemLog[]; total: number }> {
        let sql = 'SELECT * FROM system_logs WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.level && filters.level.length > 0) {
            sql += ` AND level = ANY($${paramIndex++}::text[])`;
            params.push(filters.level);
        }

        if (filters.start_date) {
            sql += ` AND created_at >= $${paramIndex++}`;
            params.push(filters.start_date);
        }

        if (filters.end_date) {
            sql += ` AND created_at <= $${paramIndex++}`;
            params.push(filters.end_date);
        }

        if (filters.user_id) {
            sql += ` AND user_id = $${paramIndex++}`;
            params.push(filters.user_id);
        }

        if (filters.error_code) {
            sql += ` AND error_code = $${paramIndex++}`;
            params.push(filters.error_code);
        }

        // Get total count
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*)');
        const countRes = await query(countSql, params);
        const total = parseInt(countRes.rows[0].count);

        // Get paginated results
        sql += ' ORDER BY created_at DESC';
        if (filters.limit) {
            sql += ` LIMIT $${paramIndex++}`;
            params.push(filters.limit);
        }
        if (filters.offset) {
            sql += ` OFFSET $${paramIndex++}`;
            params.push(filters.offset);
        }

        const res = await query(sql, params);
        return {
            logs: res.rows.map((row: any) => ({
                ...row,
                context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context
            })),
            total
        };
    }

    static async getById(id: number): Promise<SystemLog | null> {
        const res = await query('SELECT * FROM system_logs WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        const row = res.rows[0];
        return {
            ...row,
            context: typeof row.context === 'string' ? JSON.parse(row.context) : row.context
        };
    }

    static async deleteOld(olderThanDays: number): Promise<number> {
        const res = await query(
            'DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL \'$1 days\'',
            [olderThanDays]
        );
        return res.rowCount || 0;
    }
}

