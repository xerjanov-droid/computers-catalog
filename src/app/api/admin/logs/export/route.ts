import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

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
    return permissions?.logs === true || permissions?.logs?.includes?.('view');
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session || typeof session !== 'object' || !('id' in session)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkLogsPermission(session.id as number);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('format') || 'csv';
        const logType = searchParams.get('type') || 'audit';

        // Add type parameter to query
        const params: any[] = [];
        let paramIndex = 1;

        if (logType === 'audit') {
            // Build query for audit logs
            let sql = `
                SELECT 
                    al.created_at,
                    u.email as user_email,
                    u.full_name as user_name,
                    al.action,
                    al.entity_type,
                    al.entity_id,
                    al.before_data,
                    al.after_data
                FROM audit_logs al
                LEFT JOIN users u ON al.admin_user_id = u.id
                WHERE 1=1
            `;

            const entityType = searchParams.get('entity_type');
            const action = searchParams.get('action');
            const startDate = searchParams.get('start_date');
            const endDate = searchParams.get('end_date');

            if (entityType) {
                sql += ` AND al.entity_type = $${paramIndex++}`;
                params.push(entityType);
            }
            if (action) {
                sql += ` AND al.action = $${paramIndex++}`;
                params.push(action);
            }
            if (startDate) {
                sql += ` AND al.created_at >= $${paramIndex++}`;
                params.push(startDate);
            }
            if (endDate) {
                sql += ` AND al.created_at <= $${paramIndex++}`;
                params.push(endDate);
            }

            sql += ' ORDER BY al.created_at DESC';

            const res = await query(sql, params);

            if (format === 'csv') {
                // Generate CSV
                const headers = ['Sana', 'User', 'Action', 'Entity Type', 'Entity ID', 'Before', 'After'];
                const rows = res.rows.map((row: any) => [
                    new Date(row.created_at).toLocaleString('ru-RU'),
                    row.user_name || row.user_email || '',
                    row.action,
                    row.entity_type,
                    row.entity_id,
                    JSON.stringify(row.before_data || {}),
                    JSON.stringify(row.after_data || {})
                ]);

                const csv = [
                    headers.join(','),
                    ...rows.map((r: any[]) => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                ].join('\n');

                return new NextResponse(csv, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`
                    }
                });
            } else {
                // For Excel, return JSON (can be enhanced with xlsx library)
                return NextResponse.json({ logs: res.rows });
            }
        } else {
            // System logs export
            return NextResponse.json({ error: 'System logs export not implemented yet' }, { status: 501 });
        }
    } catch (e: any) {
        console.error('Export error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

