const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function setupImageTable() {
    try {
        console.log('Creating products_images table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS products_images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL,
                is_cover BOOLEAN DEFAULT FALSE,
                order_index INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Table products_images created successfully.');

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_products_images_product_id ON products_images(product_id);
        `);
        console.log('Index created/verified.');

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await pool.end();
    }
}

setupImageTable();
