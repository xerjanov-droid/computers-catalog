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

async function insertSubcategories() {
    console.log('=== Subkategoriyalarni 3 tilda database\'ga yozish ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Computers subkategoriyalari
        const computersSubcategories = `
            INSERT INTO categories (slug, parent_id, name_en, name_ru, name_uz, order_index, is_active)
            SELECT
                'all_in_one', c.id, 'All-in-One', 'Моноблоки', 'Monobloklar', 1, true
            FROM categories c WHERE c.slug='computers'
            UNION ALL
            SELECT
                'office_pc', c.id, 'Office PC', 'Офисные ПК', 'Ofis kompyuterlari', 2, true
            FROM categories c WHERE c.slug='computers'
            UNION ALL
            SELECT
                'gaming_pc', c.id, 'Gaming PC', 'Игровые ПК', 'O''yin kompyuterlari', 3, true
            FROM categories c WHERE c.slug='computers'
            UNION ALL
            SELECT
                'workstations', c.id, 'Workstations', 'Рабочие станции', 'Workstationlar', 4, true
            FROM categories c WHERE c.slug='computers'
            UNION ALL
            SELECT
                'mini_pc', c.id, 'Mini PC', 'Мини ПК', 'Mini kompyuterlar', 5, true
            FROM categories c WHERE c.slug='computers'
            ON CONFLICT (slug) DO UPDATE SET
                name_en = EXCLUDED.name_en,
                name_ru = EXCLUDED.name_ru,
                name_uz = EXCLUDED.name_uz,
                parent_id = EXCLUDED.parent_id,
                order_index = EXCLUDED.order_index,
                is_active = EXCLUDED.is_active;
        `;

        console.log('📝 Computers subkategoriyalarini yangilash/yozish...');
        const result = await client.query(computersSubcategories);
        console.log(`✅ ${result.rowCount || 0} ta subkategoriya yangilandi/yozildi\n`);

        // Yangilangan subkategoriyalarni ko'rsatish
        console.log('📋 Yangilangan subkategoriyalar:\n');
        const updated = await client.query(`
            SELECT c.id, c.slug, c.name_en, c.name_ru, c.name_uz, c.parent_id, p.slug as parent_slug
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.slug IN ('all_in_one', 'office_pc', 'gaming_pc', 'workstations', 'mini_pc')
            ORDER BY c.order_index
        `);

        updated.rows.forEach((row: any) => {
            console.log(`  [${row.id}] ${row.slug} (parent: ${row.parent_slug || row.parent_id})`);
            console.log(`      EN: ${row.name_en}`);
            console.log(`      RU: ${row.name_ru}`);
            console.log(`      UZ: ${row.name_uz}`);
            console.log('');
        });

        console.log('✅ Barcha subkategoriyalar muvaffaqiyatli yangilandi!\n');

    } catch (e: any) {
        console.error('❌ Xatolik:', e.message);
        if (e.detail) {
            console.error('   Detal: ', e.detail);
        }
        if (e.code) {
            console.error('   Kod: ', e.code);
        }
    } finally {
        await client.end();
    }
}

insertSubcategories();

