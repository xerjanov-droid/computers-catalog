
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function query(text: string, params?: any[]) {
    return pool.query(text, params);
}

async function checkSchema() {
    console.log('🔍 Checking Database Schema...');
    try {
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        const tableNames = tables.rows.map(r => r.table_name);
        console.log('📂 Found tables:', tableNames.join(', '));

        const required = ['audit_logs', 'characteristics', 'category_characteristics', 'roles', 'product_statuses'];
        const missing = required.filter(t => !tableNames.includes(t));

        if (missing.length > 0) {
            console.error('❌ Missing tables:', missing.join(', '));
            process.exit(1);
        } else {
            console.log('✅ All Schema V2 tables are present.');
        }

        // Check columns in characteristics
        const charsCols = await query(`
            SELECT column_name FROM information_schema.columns WHERE table_name = 'characteristics'
        `);
        console.log('cols in characteristics:', charsCols.rows.map(r => r.column_name).join(', '));

    } catch (e) {
        console.error('❌ Check failed:', e);
    }
}

checkSchema();
