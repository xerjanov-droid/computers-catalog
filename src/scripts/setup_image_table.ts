import { query } from '../lib/db';
import { logger } from '../lib/logger';

async function setupImageTable() {
    try {
        console.log('Creating products_images table...');

        await query(`
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

        // Add index on product_id for faster lookups
        await query(`
            CREATE INDEX IF NOT EXISTS idx_products_images_product_id ON products_images(product_id);
        `);
        console.log('Index created/verified.');

    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

setupImageTable();
