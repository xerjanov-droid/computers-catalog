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

async function deleteEmptyMainCategories() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Subkatalogga ega bo\'lmagan asosiy kataloglar topilmoqda...\n');

        // Barcha asosiy kataloglarni (parent_id IS NULL) va ularning subkategoriyalar sonini topish
        const mainCategoriesRes = await client.query(`
            SELECT 
                c.id,
                c.slug,
                c.name_ru,
                c.name_uz,
                c.name_en,
                (SELECT COUNT(*) FROM categories sc WHERE sc.parent_id = c.id) as subcategory_count,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
            FROM categories c
            WHERE c.parent_id IS NULL
            ORDER BY c.name_ru
        `);

        const mainCategories = mainCategoriesRes.rows;

        if (mainCategories.length === 0) {
            console.log('❌ Hech qanday asosiy kategoriya topilmadi.');
            return;
        }

        console.log(`📊 Jami asosiy kategoriyalar: ${mainCategories.length}\n`);

        // Subkategoriyalari bo'lmagan kategoriyalarni topish
        const emptyCategories = mainCategories.filter((cat: any) => 
            parseInt(cat.subcategory_count) === 0
        );

        if (emptyCategories.length === 0) {
            console.log('✅ Barcha asosiy kategoriyalar subkategoriyalarga ega. O\'chiriladigan kategoriyalar yo\'q.');
            return;
        }

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 SUBKATEGORIYALARI BO\'LMAGAN ASOSIY KATEGORIYALAR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        emptyCategories.forEach((cat: any, index: number) => {
            console.log(`${index + 1}. ${cat.name_ru} (${cat.slug})`);
            console.log(`   ID: ${cat.id}`);
            console.log(`   RU: ${cat.name_ru}`);
            console.log(`   UZ: ${cat.name_uz}`);
            console.log(`   EN: ${cat.name_en}`);
            console.log(`   Subkategoriyalar: ${cat.subcategory_count}`);
            console.log(`   Mahsulotlar: ${cat.product_count}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`🗑️  ${emptyCategories.length} ta kategoriya o'chirilmoqda...`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Mahsulotlari bo'lgan kategoriyalarni alohida ko'rsatish
        const categoriesWithProducts = emptyCategories.filter((cat: any) => 
            parseInt(cat.product_count) > 0
        );

        if (categoriesWithProducts.length > 0) {
            console.log('⚠️  DIQQAT: Quyidagi kategoriyalarda mahsulotlar mavjud:');
            categoriesWithProducts.forEach((cat: any) => {
                console.log(`  - ${cat.name_ru} (${cat.slug}): ${cat.product_count} ta mahsulot`);
            });
            console.log('\n⚠️  Bu kategoriyalar o\'chirilsa, ularga tegishli mahsulotlar ham o\'chiriladi!');
            console.log('Davom etishni tasdiqlash uchun scriptni o\'zgartiring va tasdiqlash flagini qo\'shing.\n');
            return;
        }

        // Tasdiqlash flagi - agar true bo'lsa, o'chiradi
        const CONFIRMED = true; // <-- Bu yerni true qiling va scriptni qayta ishga tushiring

        if (!CONFIRMED) {
            console.log('❌ Operatsiya tasdiqlanmagan. Kategoriyalar o\'chirilmadi.');
            console.log('✅ O\'chiriladigan kategoriyalar ko\'rsatildi. Agar tasdiqlasangiz, scriptdagi CONFIRMED flagini true qiling.');
            return;
        }

        console.log('✅ Operatsiya tasdiqlandi. Kategoriyalar o\'chirilmoqda...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const cat of emptyCategories) {
            try {
                // Avval kategoriyaga tegishli mahsulotlarni o'chirish (agar mavjud bo'lsa)
                await client.query('DELETE FROM products WHERE category_id = $1', [cat.id]);
                
                // Kategoriyani o'chirish
                await client.query('DELETE FROM categories WHERE id = $1', [cat.id]);
                
                console.log(`  ✅ ${cat.name_ru} (ID: ${cat.id}) o'chirildi`);
                successCount++;
            } catch (e: any) {
                console.error(`  ❌ ${cat.name_ru} (ID: ${cat.id}) - xatolik: ${e.message}`);
                errorCount++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 NATIJA');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`✅ Muvaffaqiyatli o'chirildi: ${successCount} ta`);
        if (errorCount > 0) {
            console.log(`❌ Xatoliklar: ${errorCount} ta`);
        }
        console.log(`📦 Jami: ${emptyCategories.length} ta`);

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

deleteEmptyMainCategories();

