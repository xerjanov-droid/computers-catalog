
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

async function query(text, params) {
    return pool.query(text, params);
}

// MOCKING SERVICE METHOD
async function getByCategoryId(categoryId) {
    try {
        console.log(`Executing query for category ${categoryId}...`);
        const res = await query(`
            SELECT c.*, cc.is_required, cc.show_in_key_specs, cc.order_index as link_order
            FROM characteristics c
            JOIN category_characteristics cc ON c.id = cc.characteristic_id
            WHERE cc.category_id = $1 AND c.is_active = true
            ORDER BY cc.order_index ASC
        `, [categoryId]);

        console.log('Query executed. Rows:', res.rows.length);

        const chars = res.rows;

        // Populate options for select types
        for (const char of chars) {
            if (char.type === 'select') {
                console.log(`Fetching options for char ${char.id}...`);
                const options = await query('SELECT * FROM characteristic_options WHERE characteristic_id = $1 ORDER BY order_index ASC', [char.id]);
                char.options = options.rows;
            }
        }

        return chars;
    } catch (e) {
        console.error('Service Error:', e);
        throw e;
    }
}

async function run() {
    try {
        const data = await getByCategoryId(2);
        console.log('Success:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('FAILED:', e);
    } finally {
        await pool.end();
    }
}

run();
