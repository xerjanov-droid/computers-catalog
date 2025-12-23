import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Biz qo'shgan rasmlar (default rasmlar)
const defaultImages = [
    '/images/case.png',
    '/images/notebook.png',
    '/images/monitor.png'
];

async function deleteRecentImages() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Script orqali qo\'shilgan rasmlar topilmoqda...\n');

        // Biz qo'shgan rasmlarni topish (default rasmlar)
        const imagesRes = await client.query(`
            SELECT 
                pi.id,
                pi.product_id,
                pi.image_url,
                pi.is_cover,
                pi.created_at,
                p.title_ru,
                p.brand,
                p.model
            FROM products_images pi
            JOIN products p ON pi.product_id = p.id
            WHERE pi.image_url = ANY($1)
            ORDER BY pi.id DESC
        `, [defaultImages]);

        const images = imagesRes.rows;

        if (images.length === 0) {
            console.log('✅ Script orqali qo\'shilgan rasmlar topilmadi.');
            return;
        }

        console.log(`📦 Topilgan rasmlar: ${images.length} ta\n`);

        // Rasmlarni guruhlash
        const groupedByImage: { [key: string]: typeof images } = {};
        images.forEach((img: any) => {
            if (!groupedByImage[img.image_url]) {
                groupedByImage[img.image_url] = [];
            }
            groupedByImage[img.image_url].push(img);
        });

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 O\'CHIRILADIGAN RASMLAR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        for (const imageUrl in groupedByImage) {
            console.log(`\n📁 ${imageUrl}: ${groupedByImage[imageUrl].length} ta`);
            groupedByImage[imageUrl].slice(0, 5).forEach((img: any) => {
                console.log(`  - ${img.title_ru} (Product ID: ${img.product_id}, Image ID: ${img.id})`);
            });
            if (groupedByImage[imageUrl].length > 5) {
                console.log(`  ... va yana ${groupedByImage[imageUrl].length - 5} ta`);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log(`🗑️  ${images.length} ta rasm o'chirilmoqda...`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Tasdiqlash flagi
        const CONFIRMED = true; // <-- Bu yerni true qiling va scriptni qayta ishga tushiring

        if (!CONFIRMED) {
            console.log('❌ Operatsiya tasdiqlanmagan. Rasmlar o\'chirilmadi.');
            console.log('✅ O\'chiriladigan rasmlar ko\'rsatildi. Agar tasdiqlasangiz, scriptdagi CONFIRMED flagini true qiling.');
            return;
        }

        console.log('✅ Operatsiya tasdiqlandi. Rasmlar o\'chirilmoqda...\n');

        let successCount = 0;
        let errorCount = 0;

        for (const image of images) {
            try {
                // Database'dan o'chirish
                await client.query('DELETE FROM products_images WHERE id = $1', [image.id]);
                
                // Agar local fayl bo'lsa, o'chirish
                if (image.image_url.startsWith('/images/products/')) {
                    const filepath = path.join(process.cwd(), 'public', image.image_url);
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                        console.log(`  🗑️  Fayl o'chirildi: ${image.image_url}`);
                    }
                }
                
                console.log(`  ✅ ${image.title_ru} (ID: ${image.product_id}) - rasm o'chirildi`);
                successCount++;
            } catch (e: any) {
                console.error(`  ❌ ${image.title_ru} (ID: ${image.product_id}) - xatolik: ${e.message}`);
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
        console.log(`📦 Jami rasmlar: ${images.length} ta`);

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

deleteRecentImages();

