
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

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
        console.log('Starting migration...');

        // 1. Find Source ID (Office)
        // We look for a category that has 'Office' in the name (or 'Офис')
        const officeRes = await client.query(`
            SELECT id, name_ru FROM categories 
            WHERE name_ru ILIKE '%Office%' OR name_uz ILIKE '%Office%' OR name_en ILIKE '%Office%' 
            LIMIT 1
        `);

        if (officeRes.rows.length === 0) {
            console.error('Source category "Office" not found.');
            return;
        }
        const officeId = officeRes.rows[0].id;
        console.log(`Source found: "Office" (ID: ${officeId})`);

        // 2. Find Target IDs (Gaming, Workstation, Mini PC)
        const targetNames = ['Gaming', 'Workstation', 'Mini PC'];
        const targetIds: number[] = [];

        for (const name of targetNames) {
            const res = await client.query(`
                SELECT id, name_ru FROM categories 
                WHERE name_ru ILIKE $1 OR name_uz ILIKE $1 OR name_en ILIKE $1 
                LIMIT 1
            `, [`%${name}%`]);

            if (res.rows.length > 0) {
                const updatedId = res.rows[0].id;
                targetIds.push(updatedId);
                console.log(`Target found: "${name}" (ID: ${updatedId})`);
            } else {
                console.warn(`Target category "${name}" not found. Skipping.`);
            }
        }

        if (targetIds.length === 0) {
            console.error('No target categories found.');
            return;
        }

        // 3. Perform Migration
        for (const targetId of targetIds) {
            // Idempotent Insert: Only insert if (category_id, characteristic_id) does not exist
            // Note: DB schema uses category_id, which here represents subcategory_id

            const copyQuery = `
                INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
                SELECT $1, characteristic_id, is_required, show_in_key_specs, order_index
                FROM category_characteristics
                WHERE category_id = $2
                ON CONFLICT (category_id, characteristic_id) DO NOTHING
            `;

            // Note: The schema might not have ON CONFLICT constraint explicitly set on (category_id, characteristic_id) 
            // but the TT requested "NOT EXISTS" logic. 
            // If there's a unique constraint, ON CONFLICT DO NOTHING is cleaner.
            // If not, we use WHERE NOT EXISTS. 
            // Let's assume standard behavior first, but use the NOT EXISTS pattern from TT to be safe and explicit.

            const ttStyleQuery = `
                INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
                SELECT $1, characteristic_id, is_required, show_in_key_specs, order_index
                FROM category_characteristics src
                WHERE category_id = $2
                AND NOT EXISTS (
                    SELECT 1 FROM category_characteristics tgt
                    WHERE tgt.category_id = $1
                    AND tgt.characteristic_id = src.characteristic_id
                )
            `;

            const res = await client.query(ttStyleQuery, [targetId, officeId]);
            console.log(`Migrated ${res.rowCount} characteristics to Target ID: ${targetId}`);
        }

        console.log('Migration completed successfully.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
