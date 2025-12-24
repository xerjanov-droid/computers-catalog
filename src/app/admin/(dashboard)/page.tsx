
import { query } from '@/lib/db';
import { DashboardClient } from '@/components/admin/DashboardClient';

export default async function AdminDashboard() {
    // Basic stats fetching
    let stats = {
        products: { total: 0, in_stock: 0, new_today: 0 },
        requests: { total: 0, new: 0, active: 0, closed: 0 },
        users: 0,
        recent: [] as any[]
    };

    try {
        const pRes = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_today
            FROM products
        `);

        if (pRes.rows[0]) {
            stats.products = {
                total: parseInt(pRes.rows[0].total) || 0,
                in_stock: parseInt(pRes.rows[0].in_stock) || 0,
                new_today: parseInt(pRes.rows[0].new_today) || 0
            };
        }
    } catch (e) {
        console.error("Dashboard Stats Error (Products):", e);
    }

    try {
        // Check if `status` column exists on b2b_requests and run appropriate query
        const reqStatusRes = await query(`
            SELECT EXISTS(
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'b2b_requests' AND column_name = 'status'
            ) as has_status
        `);
        const hasReqStatus = !!reqStatusRes.rows[0]?.has_status;

        let rRes;
        if (hasReqStatus) {
            try {
                rRes = await query(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_req,
                        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as closed
                    FROM b2b_requests
                `);
            } catch (e) {
                // Safe fallback if the status column causes an error
                rRes = await query(`SELECT COUNT(*) as total, 0 as new_req, 0 as active, 0 as closed FROM b2b_requests`);
            }
        } else {
            rRes = await query(`SELECT COUNT(*) as total, 0 as new_req, 0 as active, 0 as closed FROM b2b_requests`);
        }

        if (rRes.rows[0]) {
            stats.requests = {
                total: parseInt(rRes.rows[0].total) || 0,
                new: parseInt(rRes.rows[0].new_req) || 0,
                active: parseInt(rRes.rows[0].active) || 0,
                closed: parseInt(rRes.rows[0].closed) || 0
            };
        }

        // Check if `details` column exists (used for total_amount / client_name)
        const reqDetailsRes = await query(`
            SELECT EXISTS(
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'b2b_requests' AND column_name = 'details'
            ) as has_details
        `);
        const hasReqDetails = !!reqDetailsRes.rows[0]?.has_details;

        // Build recent query with safe fallbacks when columns are missing
        const recentSelects: string[] = ['id', 'type', 'created_at'];
        if (hasReqStatus) recentSelects.push('status');
        if (hasReqDetails) {
            recentSelects.push(`(details->>'total_amount')::numeric as total_amount`);
            recentSelects.push(`(details->>'client_name') as client_name`);
        } else {
            recentSelects.push(`0 as total_amount`);
            recentSelects.push(`'' as client_name`);
        }

        const recentQuery = `SELECT ${recentSelects.join(', ')} FROM b2b_requests ORDER BY created_at DESC LIMIT 5`;
        const recentRes = await query(recentQuery);
        stats.recent = recentRes.rows;

    } catch (e) {
        console.error("Dashboard Stats Error (Requests):", e);
    }

    return <DashboardClient stats={stats} />;
}
