import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkSettings() {
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Check default_product_status specifically
        const res = await client.query(
            `SELECT key, value, pg_typeof(value) as value_type, 
                    value::text as value_text 
             FROM settings WHERE key = 'default_product_status'`
        );
        
        if (res.rows.length > 0) {
            const row = res.rows[0];
            console.log('default_product_status:');
            console.log('  value:', row.value);
            console.log('  value type:', row.value_type);
            console.log('  value text:', row.value_text);
            console.log('  typeof in JS:', typeof row.value);
            console.log('  is string?', typeof row.value === 'string');
        }

        // Check all settings
        const allRes = await client.query('SELECT key, value FROM settings');
        console.log('\n📋 Barcha sozlamalar:\n');
        for (const row of allRes.rows) {
            console.log(`  ${row.key}: ${JSON.stringify(row.value)} (JS type: ${typeof row.value})`);
        }

    } catch (e: any) {
        console.error('❌ Xatolik:', e.message);
    } finally {
        await client.end();
    }
}

checkSettings();

