import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
// import { defaultStats } from '@/lib/utils'; // Not used — removed to fix build

export async function GET() {
    try {
        // 1. Products Stats
        // Check if `status` column exists on products
        const prodStatusRes = await query(`
            SELECT EXISTS(
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'products' AND column_name = 'status'
            ) as has_status
        `);
        const hasProductStatus = !!prodStatusRes.rows[0]?.has_status;

        let productsRes;
        if (hasProductStatus) {
            try {
                productsRes = await query(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
                        SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_today
                    FROM products
                `);
            } catch (e) {
                // Fallback to a safe query if status column unexpectedly causes an error
                productsRes = await query(`SELECT COUNT(*) as total, 0 as in_stock, 0 as new_today FROM products`);
            }
        } else {
            productsRes = await query(`SELECT COUNT(*) as total, 0 as in_stock, 0 as new_today FROM products`);
        }

        const pStats = productsRes.rows[0];

        // 2. B2B Requests
        // Check if `status` column exists on b2b_requests
        const reqStatusRes = await query(`
            SELECT EXISTS(
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'b2b_requests' AND column_name = 'status'
            ) as has_status
        `);
        const hasReqStatus = !!reqStatusRes.rows[0]?.has_status;

        let reqRes;
        if (hasReqStatus) {
            try {
                reqRes = await query(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_requests,
                        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active
                    FROM b2b_requests
                `);
            } catch (e) {
                reqRes = await query(`SELECT COUNT(*) as total, 0 as new_requests, 0 as active FROM b2b_requests`);
            }
        } else {
            reqRes = await query(`SELECT COUNT(*) as total, 0 as new_requests, 0 as active FROM b2b_requests`);
        }

        const rStats = reqRes.rows[0];

        return NextResponse.json({
            products: {
                total: parseInt(pStats.total),
                inStock: parseInt(pStats.in_stock),
                newToday: parseInt(pStats.new_today)
            },
            requests: {
                total: parseInt(rStats.total),
                new: parseInt(rStats.new_requests),
                active: parseInt(rStats.active)
            }
        });

    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
