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

async function insertCategories() {
    console.log('=== Kategoriyalarni 3 tilda database\'ga yozish ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Asosiy kategoriyalar
        const mainCategories = `
            INSERT INTO categories (slug, parent_id, name_en, name_ru, name_uz, order_index, is_active)
            VALUES
            ('computers', NULL, 'Computers', 'Компьютеры', 'Kompyuterlar', 1, true),
            ('laptops', NULL, 'Laptops', 'Ноутбуки', 'Noutbuklar', 2, true),
            ('monitors', NULL, 'Monitors', 'Мониторы', 'Monitorlar', 3, true),
            ('components', NULL, 'Components', 'Комплектующие', 'Komponentlar', 4, true),
            ('peripherals', NULL, 'Peripherals', 'Периферия', 'Periferiya', 5, true),
            ('office_equipment', NULL, 'Office Equipment', 'Офисная техника', 'Ofis texnikasi', 6, true),
            ('networking', NULL, 'Networking', 'Сетевое оборудование', 'Tarmoq uskunalari', 7, true),
            ('storage_devices', NULL, 'Storage Devices', 'Устройства хранения', 'Saqlash qurilmalari', 8, true),
            ('accessories', NULL, 'Accessories', 'Аксессуары', 'Aksessuarlar', 9, true),
            ('software', NULL, 'Software', 'Программное обеспечение', 'Dasturiy taʼminot', 10, true)
            ON CONFLICT (slug) DO UPDATE SET
                name_en = EXCLUDED.name_en,
                name_ru = EXCLUDED.name_ru,
                name_uz = EXCLUDED.name_uz,
                order_index = EXCLUDED.order_index,
                is_active = EXCLUDED.is_active;
        `;

        console.log('📝 Asosiy kategoriyalarni yangilash/yozish...');
        const result = await client.query(mainCategories);
        console.log(`✅ ${result.rowCount || 0} ta kategoriya yangilandi/yozildi\n`);

        // Yangilangan kategoriyalarni ko'rsatish
        console.log('📋 Yangilangan kategoriyalar:\n');
        const updated = await client.query(`
            SELECT id, slug, name_en, name_ru, name_uz, parent_id
            FROM categories
            WHERE slug IN (
                'computers', 'laptops', 'monitors', 'components', 'peripherals',
                'office_equipment', 'networking', 'storage_devices', 'accessories', 'software'
            )
            ORDER BY order_index
        `);

        updated.rows.forEach((row: any) => {
            const parent = row.parent_id ? `(parent: ${row.parent_id})` : '(root)';
            console.log(`  [${row.id}] ${row.slug} ${parent}`);
            console.log(`      EN: ${row.name_en}`);
            console.log(`      RU: ${row.name_ru}`);
            console.log(`      UZ: ${row.name_uz}`);
            console.log('');
        });

        console.log('✅ Barcha kategoriyalar muvaffaqiyatli yangilandi!\n');

    } catch (e: any) {
        console.error('❌ Xatolik:', e.message);
        if (e.detail) {
            console.error('   Detal: ', e.detail);
        }
    } finally {
        await client.end();
    }
}

insertCategories();

