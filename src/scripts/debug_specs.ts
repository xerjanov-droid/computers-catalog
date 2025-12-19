
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

async function debug() {
    await client.connect();
    // Get one product from Office PC
    const res = await client.query(`
      SELECT p.id, p.title_ru, p.category_id, p.specs,
             c1.slug as c1_slug, c1.parent_id as c1_parent,
             c2.slug as c2_slug
      FROM products p
      LEFT JOIN categories c1 ON p.category_id = c1.id
      LEFT JOIN categories c2 ON c1.parent_id = c2.id
      WHERE c1.slug = 'office-pc'
      LIMIT 1
    `);
    console.log('Product Data:', JSON.stringify(res.rows[0], null, 2));

    // Check config keys logic
    const p = res.rows[0];
    const catSlug = p.c2_slug || p.c1_slug;
    const subSlug = p.c2_slug ? p.c1_slug : null;
    console.log(`Derived: cat=${catSlug}, sub=${subSlug}`);
    console.log(`Schema Key: ${subSlug ? `${catSlug}/${subSlug}` : catSlug}`);

    await client.end();
}

debug();
