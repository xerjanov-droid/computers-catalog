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

const imageUrl = '/images/monitor.png'; // Public folder'dan nisbiy yo'l

async function addMonitorImageToProducts() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 "Monitorlar" kategoriyasi va mahsulotlar topilmoqda...\n');

        // "Monitorlar" kategoriyasini topish (slug yoki nom bo'yicha)
        const categoryRes = await client.query(`
            SELECT id, slug, name_ru, name_uz, name_en, parent_id
            FROM categories
            WHERE (slug = 'monitors' OR name_ru ILIKE '%монитор%' OR name_uz ILIKE '%monitor%')
            AND parent_id IS NULL
            LIMIT 1
        `);

        if (categoryRes.rows.length === 0) {
            console.log('❌ "Monitorlar" kategoriyasi topilmadi.');
            
            // Barcha asosiy kategoriyalarni ko'rsatish
            const allMainCategoriesRes = await client.query(`
                SELECT id, slug, name_ru, name_uz, name_en
                FROM categories
                WHERE parent_id IS NULL
                ORDER BY name_ru
            `);
            console.log('\n📋 Mavjud asosiy kategoriyalar:');
            allMainCategoriesRes.rows.forEach((cat: any) => {
                console.log(`  - ${cat.name_ru} (${cat.slug}) - ID: ${cat.id}`);
            });
            return;
        }

        const mainCategory = categoryRes.rows[0];
        console.log(`📁 Topilgan kategoriya: ${mainCategory.name_ru} (${mainCategory.slug}) - ID: ${mainCategory.id}\n`);

        // Bu kategoriyaning barcha subkategoriyalarini topish
        const subcategoriesRes = await client.query(`
            SELECT id, slug, name_ru, name_uz, name_en
            FROM categories
            WHERE parent_id = $1
            ORDER BY name_ru
        `, [mainCategory.id]);

        const subcategories = subcategoriesRes.rows;
        console.log(`📂 Topilgan subkategoriyalar: ${subcategories.length} ta\n`);
        subcategories.forEach((sub: any) => {
            console.log(`  - ${sub.name_ru} (${sub.slug}) - ID: ${sub.id}`);
        });

        // Barcha subkategoriya ID'lari + asosiy kategoriya ID (agar mahsulotlar to'g'ridan-to'g'ri kategoriyada bo'lsa)
        const categoryIds = [mainCategory.id, ...subcategories.map((s: any) => s.id)];

        // Bu kategoriyalardagi barcha mahsulotlarni topish
        const productsRes = await client.query(`
            SELECT 
                p.id, 
                p.category_id, 
                p.brand, 
                p.model, 
                p.title_ru,
                c.name_ru as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ANY($1)
            ORDER BY p.category_id, p.id
        `, [categoryIds]);

        const products = productsRes.rows;

        if (products.length === 0) {
            console.log('\n❌ Hech qanday mahsulot topilmadi.');
            return;
        }

        console.log(`\n📦 Topilgan mahsulotlar: ${products.length} ta\n`);

        // Har bir mahsulot uchun rasm qo'shish
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const product of products) {
            try {
                // Mahsulotda allaqachon bu rasm bor-yo'qligini tekshirish
                const existingImageRes = await client.query(`
                    SELECT id FROM products_images
                    WHERE product_id = $1 AND image_url = $2
                `, [product.id, imageUrl]);

                if (existingImageRes.rows.length > 0) {
                    console.log(`  ⏭️  ${product.title_ru} (ID: ${product.id}) - rasm allaqachon mavjud`);
                    skipCount++;
                    continue;
                }

                // Mahsulotda boshqa rasmlar bor-yo'qligini tekshirish
                const existingImagesRes = await client.query(`
                    SELECT COUNT(*) as count FROM products_images
                    WHERE product_id = $1
                `, [product.id]);

                const existingCount = parseInt(existingImagesRes.rows[0].count);
                const isCover = existingCount === 0; // Agar birinchi rasm bo'lsa, cover qilamiz

                // Rasm qo'shish
                await client.query(`
                    INSERT INTO products_images (product_id, image_url, is_cover, order_index)
                    VALUES ($1, $2, $3, $4)
                `, [product.id, imageUrl, isCover, existingCount]);

                console.log(`  ✅ ${product.title_ru} (ID: ${product.id}) - rasm qo'shildi${isCover ? ' (cover)' : ''}`);
                successCount++;

            } catch (e: any) {
                console.error(`  ❌ ${product.title_ru} (ID: ${product.id}) - xatolik: ${e.message}`);
                errorCount++;
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 NATIJA');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`✅ Muvaffaqiyatli qo'shildi: ${successCount} ta`);
        console.log(`⏭️  O'tkazib yuborildi (allaqachon mavjud): ${skipCount} ta`);
        if (errorCount > 0) {
            console.log(`❌ Xatoliklar: ${errorCount} ta`);
        }
        console.log(`📦 Jami mahsulotlar: ${products.length} ta`);

        // Subkategoriyalar bo'yicha statistik
        if (subcategories.length > 0) {
            console.log('\n═══════════════════════════════════════════════════════════════');
            console.log('📊 SUBKATEGORIYALAR BO\'YICHA STATISTIKA');
            console.log('═══════════════════════════════════════════════════════════════\n');

            for (const sub of subcategories) {
                const subProducts = products.filter((p: any) => p.category_id === sub.id);
                console.log(`${sub.name_ru} (${sub.slug}):`);
                console.log(`  - Jami mahsulotlar: ${subProducts.length} ta`);
                console.log('');
            }
        }

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

addMonitorImageToProducts();

