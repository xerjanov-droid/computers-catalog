import { query } from '@/lib/db';
import { AuditLog } from '@/types';

export class AuditService {
    /**
     * Records an action in the audit log.
     * @param adminUserId - ID of the admin performing the action
     * @param entityType - 'product', 'category', 'order', etc.
     * @param entityId - ID of the entity
     * @param action - 'create', 'update', 'delete', 'status_change', 'login'
     * @param before - State before change (optional)
     * @param after - State after change (optional)
     */
    static async log(
        adminUserId: number | undefined,
        entityType: string,
        entityId: number,
        action: string,
        before?: any,
        after?: any
    ): Promise<void> {
        if (!adminUserId) {
            // System action or anonymous? Log as system (null) or handle error.
            // For now we allow null for system actions
        }

        const sql = `
            INSERT INTO audit_logs (admin_user_id, entity_type, entity_id, action, before_data, after_data)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        try {
            await query(sql, [adminUserId, entityType, entityId, action, before, after]);
        } catch (error) {
            console.error('Failed to write audit log:', error);
            // Non-blocking error
        }
    }

    static async getLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
        const sql = `
            SELECT a.*, u.username as admin_username 
            FROM audit_logs a
            LEFT JOIN admin_users u ON a.admin_user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        const res = await query(sql, [limit, offset]);
        return res.rows;
    }

    static async getLogsByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
        const sql = `
            SELECT a.*, u.username as admin_username 
            FROM audit_logs a
            LEFT JOIN admin_users u ON a.admin_user_id = u.id
            WHERE a.entity_type = $1 AND a.entity_id = $2
            ORDER BY a.created_at DESC
        `;
        const res = await query(sql, [entityType, entityId]);
        return res.rows;
    }
}
