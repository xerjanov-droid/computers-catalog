
import { query } from './src/lib/db';

async function check() {
    try {
        // 1. Get Categories
        const cats = await query(`SELECT id, name_ru, parent_id FROM categories WHERE name_ru ILIKE '%Stol%'`);
        console.log('Categories found:', cats.rows);

        // 2. For each category, get char count
        for (const cat of cats.rows) {
            const chars = await query(`SELECT count(*) FROM category_characteristics WHERE category_id = $1`, [cat.id]);
            console.log(`Category ${cat.name_ru} (ID ${cat.id}) has ${chars.rows[0].count} characteristics.`);
        }
    } catch (e) {
        console.error(e);
    }
}

check();
