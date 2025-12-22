
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const query = (text: string, params?: any[]) => pool.query(text, params);

const CHARACTERISTICS_TO_ADD = [
    { key: 'cpu', name_uz: 'Protsessor', name_ru: 'Процессор', name_en: 'Processor', type: 'text' },
    { key: 'ram', name_uz: 'Operativ xotira', name_ru: 'Оперативная память', name_en: 'RAM', type: 'text' },
    { key: 'storage', name_uz: 'Xotira', name_ru: 'Память', name_en: 'Storage', type: 'text' },
    { key: 'gpu', name_uz: 'Integr. Grafika', name_ru: 'Интегр. Графика', name_en: 'Integrated Graphics', type: 'text' },
    { key: 'os', name_uz: 'OT', name_ru: 'ОС', name_en: 'OS', type: 'text' },
    { key: 'case_type', name_uz: 'Korpus turi', name_ru: 'Тип корпуса', name_en: 'Case Type', type: 'text' }
];

async function seed() {
    try {
        console.log('Connecting to DB...');
        // 1. Find the category "Office monitorlar"
        // Trying partial match
        const catRes = await query(`
            SELECT * FROM categories 
            WHERE name_uz ILIKE '%Office monitorlar%' 
               OR name_ru ILIKE '%Office monitorlar%' 
               OR name_en ILIKE '%Office monitorlar%'
        `);

        if (catRes.rows.length === 0) {
            console.log('Category "Office monitorlar" not found. Listing all categories to help identify:');
            const allCats = await query('SELECT id, name_uz, name_ru, parent_id FROM categories ORDER BY id');
            console.table(allCats.rows);
            return;
        }

        const category = catRes.rows[0];
        console.log(`Found category: ${category.name_uz} (ID: ${category.id})`);

        // 2. Insert Characteristics and Link them
        for (let i = 0; i < CHARACTERISTICS_TO_ADD.length; i++) {
            const charData = CHARACTERISTICS_TO_ADD[i];

            // Check if exists globally
            let charRes = await query('SELECT * FROM characteristics WHERE key = $1', [charData.key]);

            let charId;
            if (charRes.rows.length === 0) {
                console.log(`Creating global characteristic: ${charData.name_uz}`);
                const insertRes = await query(`
                    INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_filterable, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6, true)
                    RETURNING id
                `, [charData.key, charData.name_ru, charData.name_uz, charData.name_en, charData.type, true]);
                charId = insertRes.rows[0].id;
            } else {
                console.log(`Characteristic ${charData.name_uz} already exists.`);
                charId = charRes.rows[0].id;
            }

            // Link to Category
            console.log(`Linking ${charData.name_uz} to category ${category.id}...`);
            await query(`
                INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (category_id, characteristic_id) DO UPDATE 
                SET order_index = $5
            `, [category.id, charId, true, true, i]);
        }

        console.log('Seeding completed successfully.');

    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        await pool.end();
    }
}

seed();
