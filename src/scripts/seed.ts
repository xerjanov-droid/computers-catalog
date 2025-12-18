import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Seeding database...');

        // Categories
        const categories = [
            { name_ru: 'Принтеры', name_uz: 'Printerlar', name_en: 'Printers' },
            { name_ru: 'МФУ', name_uz: 'MFU', name_en: 'MFP' },
            { name_ru: 'Сканеры', name_uz: 'Skanerlar', name_en: 'Scanners' },
            { name_ru: 'Расходные материалы', name_uz: 'Kartridjlar', name_en: 'Consumables' },
            { name_ru: 'ИБП', name_uz: 'UPS', name_en: 'UPS' },
        ];

        for (const [index, cat] of categories.entries()) {
            await client.query(
                `INSERT INTO categories (name_ru, name_uz, name_en, order_index) 
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [cat.name_ru, cat.name_uz, cat.name_en, index]
            );
        }

        // Products (Demo)
        // Fetch Category IDs
        const catRes = await client.query('SELECT id, name_en FROM categories');
        const catMap = new Map(catRes.rows.map(r => [r.name_en, r.id]));

        const products = [
            {
                cat: 'Printers', brand: 'HP', model: 'LaserJet Pro M404dn', sku: 'HP-M404DN',
                title_ru: 'Принтер HP LaserJet Pro M404dn',
                price: 3500000, tech: 'laser', format: 'A4', duplex: true, wifi: false
            },
            {
                cat: 'MFP', brand: 'Canon', model: 'i-SENSYS MF443dw', sku: 'CN-MF443DW',
                title_ru: 'МФУ Canon i-SENSYS MF443dw',
                price: 5200000, tech: 'laser', format: 'A4', duplex: true, wifi: true
            },
            {
                cat: 'Printers', brand: 'Epson', model: 'L805', sku: 'EP-L805',
                title_ru: 'Принтер Epson L805',
                price: 4100000, tech: 'inkjet', format: 'A4', duplex: false, wifi: true
            }
        ];

        for (const p of products) {
            const catId = catMap.get(p.cat);
            if (catId) {
                await client.query(
                    `INSERT INTO products 
           (category_id, brand, model, sku, title_ru, technology, format, duplex, wifi, price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (sku) DO NOTHING`,
                    [catId, p.brand, p.model, p.sku, p.title_ru, p.tech, p.format, p.duplex, p.wifi, p.price]
                );
            }
        }

        console.log('Seeding completed.');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
