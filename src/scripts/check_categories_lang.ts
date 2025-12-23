import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Try .env.local first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function checkCategories() {
    console.log('--- Checking Categories Language Data ---\n');
    
    try {
        await client.connect();
        console.log('✅ Connected to database\n');

        // Check categories with missing or identical translations
        const missingTranslations = await client.query(`
            SELECT id, name_en, name_ru, name_uz, slug
            FROM categories
            WHERE name_ru IS NULL 
               OR name_uz IS NULL 
               OR name_ru = name_en 
               OR name_uz = name_en
               OR name_ru = ''
               OR name_uz = ''
            ORDER BY id
            LIMIT 20
        `);

        console.log(`Found ${missingTranslations.rows.length} categories with missing/identical translations:\n`);
        
        if (missingTranslations.rows.length > 0) {
            missingTranslations.rows.forEach((row: any) => {
                console.log(`ID: ${row.id} | Slug: ${row.slug}`);
                console.log(`  EN: ${row.name_en || '(empty)'}`);
                console.log(`  RU: ${row.name_ru || '(empty)'} ${row.name_ru === row.name_en ? '⚠️ (same as EN)' : ''}`);
                console.log(`  UZ: ${row.name_uz || '(empty)'} ${row.name_uz === row.name_en ? '⚠️ (same as EN)' : ''}`);
                console.log('');
            });
        } else {
            console.log('✅ All categories have proper translations!\n');
        }

        // Show sample of all categories
        console.log('--- Sample of All Categories (first 10) ---\n');
        const allCategories = await client.query(`
            SELECT id, name_en, name_ru, name_uz, slug, parent_id
            FROM categories
            ORDER BY id
            LIMIT 10
        `);

        allCategories.rows.forEach((row: any) => {
            const parent = row.parent_id ? `(parent: ${row.parent_id})` : '(root)';
            console.log(`ID: ${row.id} ${parent} | Slug: ${row.slug}`);
            console.log(`  EN: ${row.name_en}`);
            console.log(`  RU: ${row.name_ru}`);
            console.log(`  UZ: ${row.name_uz}`);
            console.log('');
        });

        // Statistics
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN name_ru IS NULL OR name_ru = '' THEN 1 END) as missing_ru,
                COUNT(CASE WHEN name_uz IS NULL OR name_uz = '' THEN 1 END) as missing_uz,
                COUNT(CASE WHEN name_ru = name_en THEN 1 END) as ru_same_as_en,
                COUNT(CASE WHEN name_uz = name_en THEN 1 END) as uz_same_as_en
            FROM categories
        `);

        console.log('--- Statistics ---\n');
        const stat = stats.rows[0];
        console.log(`Total categories: ${stat.total}`);
        console.log(`Missing RU: ${stat.missing_ru}`);
        console.log(`Missing UZ: ${stat.missing_uz}`);
        console.log(`RU same as EN: ${stat.ru_same_as_en}`);
        console.log(`UZ same as EN: ${stat.uz_same_as_en}`);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.end();
    }
}

checkCategories();

