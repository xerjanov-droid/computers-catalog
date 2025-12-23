import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

// Check if user has permission to view logs
async function checkLogsPermission(userId: number): Promise<boolean> {
    // Try users table first, then admin_users
    let res = await query(`
        SELECT r.permissions, r.slug
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
    `, [userId]);
    
    // If not found in users, try admin_users
    if (res.rows.length === 0) {
        res = await query(`
            SELECT r.permissions, r.slug
            FROM admin_users au
            LEFT JOIN roles r ON au.role_slug = r.slug
            WHERE au.id = $1
        `, [userId]);
    }
    
    if (res.rows.length === 0) return false;
    const permissions = res.rows[0].permissions;
    const roleSlug = res.rows[0].slug;
    
    // Super Admin and Manager can view logs
    if (roleSlug === 'super_admin' || roleSlug === 'manager' || permissions?.all === true) return true;
    
    // Check if user has logs permission (view only is enough)
    return permissions?.logs === true || permissions?.logs?.includes?.('view');
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkLogsPermission(session.id as number);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden: No permission to view logs' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const entityType = searchParams.get('entity_type');
        const action = searchParams.get('action');
        const userId = searchParams.get('user_id');
        const startDate = searchParams.get('start_date');
        const endDate = searchParams.get('end_date');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let sql = `
            SELECT 
                al.*,
                u.email as user_email,
                u.full_name as user_name
            FROM audit_logs al
            LEFT JOIN users u ON al.admin_user_id = u.id
            WHERE 1=1
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (entityType) {
            sql += ` AND al.entity_type = $${paramIndex++}`;
            params.push(entityType);
        }

        if (action) {
            sql += ` AND al.action = $${paramIndex++}`;
            params.push(action);
        }

        if (userId) {
            sql += ` AND al.admin_user_id = $${paramIndex++}`;
            params.push(parseInt(userId));
        }

        if (startDate) {
            sql += ` AND al.created_at >= $${paramIndex++}`;
            params.push(startDate);
        }

        if (endDate) {
            sql += ` AND al.created_at <= $${paramIndex++}`;
            params.push(endDate);
        }

        // Get total count
        const countSql = sql.replace('SELECT al.*, u.email as user_email, u.full_name as user_name', 'SELECT COUNT(*)');
        const countRes = await query(countSql, params);
        const total = parseInt(countRes.rows[0].count);

        // Get paginated results
        sql += ` ORDER BY al.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
        params.push(limit, offset);

        const res = await query(sql, params);

        return NextResponse.json({
            logs: res.rows,
            total,
            limit,
            offset
        });
    } catch (e: any) {
        console.error('Audit logs GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

