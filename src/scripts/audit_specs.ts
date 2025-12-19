
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

async function audit() {
    await client.connect();

    console.log('--- AUDIT START: Products with NO SPECS ---');

    // Query for products where specs is null or empty jsonb
    const res = await client.query(`
        SELECT p.id, p.title_ru, c.slug as category_slug, c.name_ru as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.specs IS NULL OR p.specs::text = '{}'
    `);

    if (res.rows.length === 0) {
        console.log('✅ All products have specs!');
    } else {
        console.log(`❌ Found ${res.rows.length} products without specs:`);
        const missingCategories = new Set<string>();

        res.rows.forEach(row => {
            console.log(`- [${row.category_slug}] ${row.title_ru}`);
            missingCategories.add(row.category_slug);
        });

        console.log('\n--- Missing Categories List ---');
        console.log(Array.from(missingCategories).join(', '));
    }

    await client.end();
}

audit();
