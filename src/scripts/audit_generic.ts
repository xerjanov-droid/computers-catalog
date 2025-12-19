
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

async function auditGeneric() {
    await client.connect();

    console.log('--- AUDIT: Products with GENERIC specs ---');

    const res = await client.query(`
        SELECT p.id, p.title_ru, c.slug as category_slug
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.specs->>'model' = 'Generic Model'
    `);

    if (res.rows.length === 0) {
        console.log('✅ No generic products found.');
    } else {
        console.log(`❌ Found ${res.rows.length} generic products:`);
        const cats = new Set<string>();
        res.rows.forEach(row => {
            cats.add(row.category_slug);
        });
        console.log('Categories needing implementation:', Array.from(cats).join(', '));
    }

    await client.end();
}

auditGeneric();
