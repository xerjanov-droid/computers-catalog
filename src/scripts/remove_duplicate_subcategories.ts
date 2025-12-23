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

async function removeDuplicateSubcategories() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Topilayotgan bir xil nomdagi subkategoriyalar...\n');

        // 1. Barcha subkategoriyalarni olish (parent_id IS NOT NULL)
        const subcategories = await client.query(`
            SELECT 
                c.id,
                c.parent_id,
                c.slug,
                c.name_ru,
                c.name_uz,
                c.name_en,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
            FROM categories c
            WHERE c.parent_id IS NOT NULL
            ORDER BY c.name_ru, c.id
        `);

        console.log(`Jami subkategoriyalar: ${subcategories.rows.length}\n`);

        // 2. Bir xil nomdagi subkategoriyalarni guruhlash
        const nameGroups: { [key: string]: typeof subcategories.rows } = {};

        for (const sub of subcategories.rows) {
            // name_ru bo'yicha guruhlash (asosiy til sifatida)
            const key = sub.name_ru?.toLowerCase().trim() || '';
            if (!key) continue;

            if (!nameGroups[key]) {
                nameGroups[key] = [];
            }
            nameGroups[key].push(sub);
        }

        // 3. Bir xil nomdagi 2+ subkategoriya bo'lgan guruhlarni topish
        const duplicates: { [key: string]: typeof subcategories.rows } = {};
        for (const [key, items] of Object.entries(nameGroups)) {
            if (items.length >= 2) {
                duplicates[key] = items;
            }
        }

        console.log(`Bir xil nomdagi subkategoriyalar guruhlari: ${Object.keys(duplicates).length}\n`);

        if (Object.keys(duplicates).length === 0) {
            console.log('✅ Bir xil nomdagi subkategoriyalar topilmadi.');
            return;
        }

        // 4. Har bir guruhda mahsulotlar sonini tekshirish va o'chirish
        let deletedCount = 0;
        const toDelete: number[] = [];

        for (const [name, items] of Object.entries(duplicates)) {
            console.log(`\n📦 "${name}" nomli subkategoriyalar (${items.length} ta):`);
            
            // Mahsulotlar soni bo'yicha saralash (kam mahsulotli birinchi)
            const sorted = [...items].sort((a, b) => {
                const countA = parseInt(String(a.product_count || '0'));
                const countB = parseInt(String(b.product_count || '0'));
                return countA - countB;
            });

            // Har bir subkategoriyani ko'rsatish
            for (const item of sorted) {
                const productCount = parseInt(String(item.product_count || '0'));
                console.log(`  - ID: ${item.id}, Slug: ${item.slug}, Mahsulotlar: ${productCount}`);
            }

            // Agar bir xil nomdagi 2+ subkategoriya bo'lsa va birida mahsulot yo'q bo'lsa
            // yoki kam mahsulot bo'lsa, uni o'chirish
            if (sorted.length >= 2) {
                // Birinchi (kam mahsulotli) subkategoriyani o'chirish
                const first = sorted[0];
                const firstProductCount = parseInt(String(first.product_count || '0'));
                
                // Agar birinchi subkategoriyada mahsulot yo'q bo'lsa
                if (firstProductCount === 0) {
                    console.log(`  ❌ O'chiriladi: ID ${first.id} (mahsulotlar yo'q)`);
                    toDelete.push(first.id);
                    deletedCount++;
                } else {
                    // Agar birinchi subkategoriyada kam mahsulot bo'lsa va ikkinchisida ko'p bo'lsa
                    const second = sorted[1];
                    const secondProductCount = parseInt(String(second.product_count || '0'));
                    
                    if (firstProductCount < secondProductCount && firstProductCount === 0) {
                        console.log(`  ❌ O'chiriladi: ID ${first.id} (kam mahsulot: ${firstProductCount} < ${secondProductCount})`);
                        toDelete.push(first.id);
                        deletedCount++;
                    } else {
                        console.log(`  ⚠️  O'chirilmaydi: ikkalasida ham mahsulotlar bor`);
                    }
                }
            }
        }

        if (toDelete.length === 0) {
            console.log('\n✅ O\'chirish uchun subkategoriyalar topilmadi (barchasida mahsulotlar bor).');
            return;
        }

        // 5. O'chirish
        console.log(`\n🗑️  ${toDelete.length} ta subkategoriya o'chirilmoqda...\n`);

        for (const id of toDelete) {
            // Avval category_characteristics, category_filters kabi bog'liq jadvallardan o'chirish
            await client.query('DELETE FROM category_characteristics WHERE category_id = $1', [id]);
            await client.query('DELETE FROM category_filters WHERE subcategory_id = $1', [id]);
            
            // Keyin kategoriyani o'chirish
            const result = await client.query('DELETE FROM categories WHERE id = $1', [id]);
            console.log(`  ✅ ID ${id} o'chirildi`);
        }

        console.log(`\n✅ Muvaffaqiyatli! ${deletedCount} ta subkategoriya o'chirildi.`);

    } catch (e) {
        console.error('❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

removeDuplicateSubcategories();

