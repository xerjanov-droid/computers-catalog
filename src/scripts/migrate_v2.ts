
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    console.log('🚀 Starting Schema V2 Migration (Manual Pool)...');

    // Test connection first
    try {
        const testClient = await pool.connect();
        const res = await testClient.query('SELECT NOW()');
        console.log('✅ DB Connected:', res.rows[0]);
        testClient.release();
    } catch (e: any) {
        console.error('❌ Connection Failed:', e.message);
        process.exit(1);
    }

    const client = await pool.connect();
    const schemaPath = path.join(process.cwd(), 'src/lib/schema_v2.sql');

    try {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('✅ Migration V2 applied successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }

    process.exit(0);
}

migrate();
