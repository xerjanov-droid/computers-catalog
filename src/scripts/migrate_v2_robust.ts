
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load envs exactly like setup_auth_tables.ts
dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function main() {
    console.log('🚀 Starting Schema V2 Migration (Robust Debug)...');
    console.log('DB Config:', {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        db: process.env.DB_NAME,
        passLen: process.env.DB_PASSWORD?.length,
        port: process.env.DB_PORT
    });
    const client = await pool.connect();

    try {
        const schemaPath = path.join(process.cwd(), 'src/lib/schema_v2.sql');
        console.log('📂 Reading schema from:', schemaPath);
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
    }
}

main().then(() => pool.end());
