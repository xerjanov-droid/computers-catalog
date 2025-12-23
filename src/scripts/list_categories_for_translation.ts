import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

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

async function listCategories() {
    try {
        await client.connect();
        
        const result = await client.query(`
            SELECT id, slug, name_en, name_ru, name_uz
            FROM categories
            WHERE name_ru = name_en OR name_uz = name_en
            ORDER BY id
        `);

        console.log('-- Categories needing translation --\n');
        console.log('Format: UPDATE categories SET name_ru = \'RU_TEXT\', name_uz = \'UZ_TEXT\' WHERE slug = \'slug\';\n');
        
        result.rows.forEach((row: any) => {
            console.log(`-- ID: ${row.id} | EN: ${row.name_en}`);
            console.log(`UPDATE categories SET name_ru = '???', name_uz = '???' WHERE slug = '${row.slug}';`);
            console.log('');
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

listCategories();

