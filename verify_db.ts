
import dotenv from 'dotenv';
dotenv.config();

import { query } from './src/lib/db';

async function main() {
    try {
        console.log('Searching for Gaming category...');
        // 1. Find Gaming Category ID
        const categories = await query(`
            SELECT id, name_ru, name_uz 
            FROM categories 
            WHERE name_ru ILIKE '%Gaming%' OR name_uz ILIKE '%Gaming%' OR name_en ILIKE '%Gaming%'
        `);

        console.log('Categories found:', categories.rows);

        if (categories.rows.length === 0) {
            console.log('No Gaming category found.');
            return;
        }

        const gamingId = categories.rows[0].id;
        console.log(`Using Gaming ID: ${gamingId}`);

        // 2. Select Characteristics
        const characteristics = await query(`
            SELECT * 
            FROM category_characteristics 
            WHERE category_id = $1
        `, [gamingId]);

        console.log('Characteristics count:', characteristics.rows.length);
        console.log('Characteristics:', JSON.stringify(characteristics.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

main();
