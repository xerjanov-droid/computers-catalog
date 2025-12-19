import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { defaultStats } from '@/lib/utils'; // Assumption: logic to fill empty data

export async function GET() {
    try {
        // 1. Products Stats
        const productsRes = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock,
            SUM(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as new_today
        FROM products
    `);
        const pStats = productsRes.rows[0];

        // 2. B2B Requests
        const reqRes = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_requests,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active
        FROM b2b_requests
    `);
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
