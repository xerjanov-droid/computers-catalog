import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const dbName = process.env.DB_NAME;
        const tables = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
        return NextResponse.json({
            connected_db: dbName,
            tables: tables.rows.map(r => r.table_name)
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}
