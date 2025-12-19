
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

async function check() {
    console.log('--- Checking DB Stats (Direct Client) ---');
    try {
        await client.connect();

        const catRes = await client.query('SELECT COUNT(*) FROM categories');
        console.log('Categories:', catRes.rows[0].count);

        const prodRes = await client.query('SELECT COUNT(*) FROM products');
        console.log('Products:', prodRes.rows[0].count);

        const statusRes = await client.query('SELECT status, COUNT(*) FROM products GROUP BY status');
        console.log('Products by Status:', statusRes.rows);

        const dashQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'in_stock' THEN 1 ELSE 0 END) as in_stock
            FROM products
        `;
        const dashRes = await client.query(dashQuery);
        console.log('Dashboard Query Result:', dashRes.rows[0]);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

check();
