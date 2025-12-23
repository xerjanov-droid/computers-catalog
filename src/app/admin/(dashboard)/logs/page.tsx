import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { LogsClient } from '@/components/admin/logs/LogsClient';

export default async function LogsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/admin/login');
    }

    // Fetch initial audit logs (last 50)
    const auditLogs = await query(`
        SELECT 
            al.*,
            u.email as user_email,
            u.full_name as user_name
        FROM audit_logs al
        LEFT JOIN users u ON al.admin_user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 50
    `);

    // Get unique entity types and actions for filters
    const entityTypes = await query(`
        SELECT DISTINCT entity_type FROM audit_logs ORDER BY entity_type
    `);
    const actions = await query(`
        SELECT DISTINCT action FROM audit_logs ORDER BY action
    `);

    return (
        <LogsClient
            initialAuditLogs={auditLogs.rows}
            entityTypes={entityTypes.rows.map((r: any) => r.entity_type)}
            actions={actions.rows.map((r: any) => r.action)}
        />
    );
}

