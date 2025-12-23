import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkProductsWithoutImages() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                p.id, 
                p.title_ru, 
                c.name_ru as cat_name, 
                c.slug as cat_slug, 
                pc.name_ru as parent_name, 
                pc.slug as parent_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN categories pc ON c.parent_id = pc.id
            WHERE NOT EXISTS (
                SELECT 1 FROM products_images pi WHERE pi.product_id = p.id
            )
            ORDER BY p.id
        `);
        
        console.log('Rasmi yo\'q mahsulotlar:\n');
        res.rows.forEach((r: any) => {
            console.log(`ID: ${r.id}, Title: ${r.title_ru}`);
            console.log(`  Category: ${r.cat_name} (${r.cat_slug})`);
            console.log(`  Parent: ${r.parent_name || 'N/A'} (${r.parent_slug || 'N/A'})`);
            console.log('');
        });
    } finally {
        client.release();
        await pool.end();
    }
}

checkProductsWithoutImages();

