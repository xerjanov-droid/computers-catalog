
import { query } from './src/lib/db';

async function listCategories() {
    try {
        const res = await query('SELECT id, name_ru, parent_id FROM categories');
        console.log('Categories in DB:', res.rows);
    } catch (err) {
        console.error('Error:', err);
    }
}

listCategories();
