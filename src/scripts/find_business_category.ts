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

async function findBusinessCategory() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT id, slug, name_ru, name_uz, name_en, parent_id
            FROM categories
            WHERE parent_id IS NOT NULL
            ORDER BY name_ru
        `);
        
        console.log('Barcha subkategoriyalar:\n');
        res.rows.forEach((cat: any) => {
            const nameRu = cat.name_ru.toLowerCase();
            const nameUz = cat.name_uz.toLowerCase();
            const nameEn = cat.name_en.toLowerCase();
            
            if (nameRu.includes('бизнес') || nameRu.includes('business') || 
                nameUz.includes('biznes') || nameUz.includes('business') ||
                nameEn.includes('business')) {
                console.log(`  *** ${cat.name_ru} (${cat.slug}) - ID: ${cat.id}`);
            } else {
                console.log(`  - ${cat.name_ru} (${cat.slug}) - ID: ${cat.id}`);
            }
        });
    } finally {
        client.release();
        await pool.end();
    }
}

findBusinessCategory();

