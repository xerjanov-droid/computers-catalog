
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function check() {
    try {
        console.log('Checking DB...');
        // 1. Get Category ID
        const catRes = await pool.query("SELECT id, name_uz FROM categories WHERE name_uz ILIKE '%Stol kompyuterlari (Office)%'");

        if (catRes.rows.length === 0) {
            console.log('Category not found!');
            return;
        }

        const category = catRes.rows[0];
        console.log(`Category Found: ID ${category.id} - ${category.name_uz}`);

        // 2. Check Linked Characteristics
        const charRes = await pool.query('SELECT * FROM category_characteristics WHERE category_id = $1', [category.id]);
        console.log(`Linked Characteristics Count: ${charRes.rowCount}`);
        if (charRes.rowCount > 0) {
            console.table(charRes.rows);
        } else {
            console.log('No characteristics linked to this category.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

check();
