import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { SettingsService } from '@/services/settings.service';
import { query } from '@/lib/db';

// Check if user has permission to access settings
async function checkSettingsPermission(userId: number): Promise<boolean> {
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
    
    // Super Admin has all permissions
    if (roleSlug === 'super_admin' || permissions?.all === true) return true;
    
    // Check if user has settings permission
    return permissions?.settings === true || permissions?.settings?.includes?.('view') || permissions?.settings?.includes?.('edit');
}

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || typeof session === 'string' || (session as any).id == null) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number((session as any).id) as number;
        const hasPermission = await checkSettingsPermission(userId);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden: No permission to view settings' }, { status: 403 });
        }

        const category = request.nextUrl.searchParams.get('category');
        const settings = category 
            ? await SettingsService.getByCategory(category)
            : await SettingsService.getAll();

        return NextResponse.json(settings);
    } catch (e: any) {
        console.error('Settings GET error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || typeof session === 'string' || (session as any).id == null) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = Number((session as any).id) as number;
        const hasPermission = await checkSettingsPermission(userId);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Forbidden: No permission to edit settings' }, { status: 403 });
        }

        const body = await request.json();
        const { updates } = body; // Array of { key, value }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: 'Invalid format: updates must be an array' }, { status: 400 });
        }

        const result = await SettingsService.updateMany(updates, userId);
        
        // Log the settings change
        await query(
            `INSERT INTO audit_logs (entity_type, entity_id, action, after_data, admin_user_id)
             VALUES ('settings', 0, 'update', $1::jsonb, $2)`,
            [JSON.stringify({ updates }), userId]
        );

        return NextResponse.json({ success: true, settings: result });
    } catch (e: any) {
        console.error('Settings PUT error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

