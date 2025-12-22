
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function listCategories() {
    try {
        const res = await pool.query('SELECT id, name_ru, order_index FROM categories LIMIT 1');
        console.log('Category sample:', res.rows[0]);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

listCategories();
