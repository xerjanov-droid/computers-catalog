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

// Subkategoriya slug'lari
const targetSubcategories = [
    'office-pc',      // Ofis kompyuterlari
    'gaming-pc',      // O'yin kompyuterlari
    'workstations'    // Workstationlar
];

const imageUrl = '/images/case.png'; // Public folder'dan nisbiy yo'l

async function addCaseImageToProducts() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Subkategoriyalar va mahsulotlar topilmoqda...\n');

        // Subkategoriyalarni topish
        const categoriesRes = await client.query(`
            SELECT id, slug, name_ru, name_uz, name_en
            FROM categories
            WHERE slug = ANY($1)
        `, [targetSubcategories]);

        const categories = categoriesRes.rows;

        if (categories.length === 0) {
            console.log('❌ Hech qanday subkategoriya topilmadi.');
            return;
        }

        console.log(`📁 Topilgan subkategoriyalar (${categories.length} ta):\n`);
        categories.forEach((cat: any) => {
            console.log(`  - ${cat.name_ru} (${cat.slug}) - ID: ${cat.id}`);
        });

        const categoryIds = categories.map((c: any) => c.id);

        // Bu subkategoriyalardagi barcha mahsulotlarni topish
        const productsRes = await client.query(`
            SELECT id, category_id, brand, model, title_ru
            FROM products
            WHERE category_id = ANY($1)
            ORDER BY category_id, id
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
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 SUBKATEGORIYALAR BO\'YICHA STATISTIKA');
        console.log('═══════════════════════════════════════════════════════════════\n');

        for (const cat of categories) {
            const catProducts = products.filter((p: any) => p.category_id === cat.id);
            const catProductsWithImage = catProducts.filter((p: any) => {
                // Bu mahsulot uchun rasm qo'shilgan yoki mavjudligini tekshirish
                return true; // Soddalashtirilgan
            });

            console.log(`${cat.name_ru} (${cat.slug}):`);
            console.log(`  - Jami mahsulotlar: ${catProducts.length} ta`);
            console.log('');
        }

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

addCaseImageToProducts();

