import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SystemLogService } from '@/services/system-log.service';

// Check if user has permission to view system logs (only Super Admin)
async function checkSystemLogsPermission(userId: number): Promise<boolean> {
    const { query } = await import('@/lib/db');
    
    // Try users table first, then admin_users
    let res = await query(`
        SELECT r.slug, r.permissions
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
    `, [userId]);
    
    // If not found in users, try admin_users
    if (res.rows.length === 0) {
        res = await query(`
            SELECT r.slug, r.permissions
            FROM admin_users au
            LEFT JOIN roles r ON au.role_slug = r.slug
            WHERE au.id = $1
        `, [userId]);
    }
    
    if (res.rows.length === 0) return false;
    const role = res.rows[0];
    
    // Only Super Admin can view system logs
    return role.slug === 'super_admin' || role.permissions?.all === true;
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const hasPermission = await checkSystemLogsPermission(session.id as number);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden: Only Super Admin can view system logs' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const filters = {
            level: searchParams.get('level')?.split(','),
            start_date: searchParams.get('start_date') || undefined,
            end_date: searchParams.get('end_date') || undefined,
            user_id: searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined,
            error_code: searchParams.get('error_code') || undefined,
            limit: parseInt(searchParams.get('limit') || '50'),
            offset: parseInt(searchParams.get('offset') || '0')
        };

        const result = await SystemLogService.getAll(filters);

        return NextResponse.json(result);
    } catch (e: any) {
        console.error('System logs GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

