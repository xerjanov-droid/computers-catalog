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

async function deleteEmptySubcategories() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Ichida mahsulot bo\'lmagan subkategoriyalar topilmoqda...\n');

        // Ichida mahsulot bo'lmagan subkategoriyalarni topish
        const result = await client.query(`
            SELECT 
                c.id,
                c.parent_id,
                c.slug,
                c.name_ru,
                c.name_uz,
                c.name_en,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
                (SELECT name_ru FROM categories WHERE id = c.parent_id) as parent_name_ru
            FROM categories c
            WHERE c.parent_id IS NOT NULL
                AND (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) = 0
            ORDER BY c.name_ru ASC
        `);

        const emptySubcategories = result.rows;

        if (emptySubcategories.length === 0) {
            console.log('✅ Ichida mahsulot bo\'lmagan subkategoriyalar topilmadi.');
            return;
        }

        console.log(`📦 Topilgan bo'sh subkategoriyalar: ${emptySubcategories.length}\n`);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 O\'CHIRILADIGAN SUBKATEGORIYALAR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Ro'yxatni ko'rsatish
        for (let i = 0; i < emptySubcategories.length; i++) {
            const sub = emptySubcategories[i];
            console.log(`${i + 1}. ID: ${sub.id} | Slug: ${sub.slug}`);
            console.log(`   Parent: ${sub.parent_name_ru || `ID: ${sub.parent_id}`}`);
            console.log(`   RU: ${sub.name_ru || '-'}`);
            console.log(`   UZ: ${sub.name_uz || '-'}`);
            console.log(`   EN: ${sub.name_en || '-'}`);
            console.log('');
        }

        const idsToDelete = emptySubcategories.map((s: any) => s.id);

        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`🗑️  ${idsToDelete.length} ta subkategoriya o'chirilmoqda...`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Har bir subkategoriyani o'chirish
        let deletedCount = 0;
        let errorCount = 0;

        for (const sub of emptySubcategories) {
            try {
                // 1. category_characteristics jadvalidan bog'liq ma'lumotlarni o'chirish
                await client.query('DELETE FROM category_characteristics WHERE category_id = $1', [sub.id]);
                
                // 2. category_filters jadvalidan bog'liq ma'lumotlarni o'chirish
                await client.query('DELETE FROM category_filters WHERE subcategory_id = $1', [sub.id]);
                
                // 3. categories jadvalidan o'chirish
                await client.query('DELETE FROM categories WHERE id = $1', [sub.id]);
                
                console.log(`  ✅ ID ${sub.id} (${sub.slug}) - "${sub.name_ru}" o'chirildi`);
                deletedCount++;
            } catch (e: any) {
                console.error(`  ❌ ID ${sub.id} (${sub.slug}) o'chirishda xatolik: ${e.message}`);
                errorCount++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 NATIJA');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`✅ Muvaffaqiyatli o'chirildi: ${deletedCount} ta`);
        if (errorCount > 0) {
            console.log(`❌ Xatoliklar: ${errorCount} ta`);
        }
        console.log(`📦 Jami: ${emptySubcategories.length} ta`);

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

deleteEmptySubcategories();

