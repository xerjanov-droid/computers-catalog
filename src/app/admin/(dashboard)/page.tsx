
import { query } from '@/lib/db';
import { DashboardClient } from '@/components/admin/DashboardClient';

export default async function AdminDashboard() {
    // Basic stats fetching
    let stats = {
        products: { total: 0, in_stock: 0, new_today: 0 },
        requests: { total: 0, new: 0, active: 0, closed: 0 },
        users: 0,
        recent: []
    };

    try {
        const pRes = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
                SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_today
            FROM products
        `);

        // Handle B2B Requests if table has status column (migrated)
        const rRes = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_req,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as closed
            FROM b2b_requests
        `);

        // Use safe selection for recent requests
        // Check if table exists to avoid crash if migration failed
        const recentRes = await query(`
            SELECT id, type, created_at, status, 
                   (details->>'total_amount')::numeric as total_amount,
                   (details->>'client_name') as client_name
            FROM b2b_requests 
            ORDER BY created_at DESC LIMIT 5
        `);

        stats = {
            products: {
                total: parseInt(pRes.rows[0].total) || 0,
                in_stock: parseInt(pRes.rows[0].in_stock) || 0,
                new_today: parseInt(pRes.rows[0].new_today) || 0
            },
            requests: {
                total: parseInt(rRes.rows[0].total) || 0,
                new: parseInt(rRes.rows[0].new_req) || 0,
                active: parseInt(rRes.rows[0].active) || 0,
                closed: parseInt(rRes.rows[0].closed) || 0
            },
            users: 0,
            recent: recentRes.rows
        };
    } catch (e) {
        console.error("Dashboard Stats Error (DB might be migrating):", e);
    }

    return <DashboardClient stats={stats} />;
}
