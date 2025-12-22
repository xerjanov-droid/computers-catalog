
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Find Gaming Category ID (Search all languages)
        const gamingRes = await query(`
            SELECT id FROM categories 
            WHERE name_ru ILIKE '%Gaming%' OR name_uz ILIKE '%Gaming%' OR name_en ILIKE '%Gaming%' 
            LIMIT 1
        `);

        // Find Office Category ID (Search all languages)
        const officeRes = await query(`
            SELECT id FROM categories 
            WHERE name_ru ILIKE '%Office%' OR name_uz ILIKE '%Office%' OR name_en ILIKE '%Office%' 
            LIMIT 1
        `);

        if (gamingRes.rows.length === 0 || officeRes.rows.length === 0) {
            return NextResponse.json({
                error: 'Categories not found',
                gaming: gamingRes.rows,
                office: officeRes.rows
            });
        }

        const gamingId = gamingRes.rows[0].id;
        const officeId = officeRes.rows[0].id;

        // 2. Simulate Copy
        const copyResult = await query(`
            INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
            SELECT $1, characteristic_id, is_required, show_in_key_specs, order_index
            FROM category_characteristics
            WHERE category_id = $2
            ON CONFLICT (category_id, characteristic_id) DO NOTHING
            RETURNING *
        `, [gamingId, officeId]);

        // 3. Select Results
        const characteristics = await query(`
             SELECT * 
            FROM category_characteristics 
            WHERE category_id = $1
        `, [gamingId]);

        return NextResponse.json({
            gamingId,
            officeId,
            copiedCount: copyResult.rowCount,
            finalCharacteristicsCount: characteristics.rows.length,
            characteristics: characteristics.rows
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
