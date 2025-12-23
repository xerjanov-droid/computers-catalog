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

async function listCategoryCharacteristics() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Subkategoriyalarga bog\'langan xarakteristikalar topilmoqda...\n');

        // Subkategoriyalar va ularga bog'langan xarakteristikalar
        const result = await client.query(`
            SELECT 
                c.id as category_id,
                c.slug as category_slug,
                c.name_ru as category_name_ru,
                c.name_uz as category_name_uz,
                c.name_en as category_name_en,
                (SELECT name_ru FROM categories WHERE id = c.parent_id) as parent_name_ru,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
                COUNT(cc.characteristic_id) as characteristic_count,
                STRING_AGG(
                    ch.key || ' (' || ch.name_ru || ')',
                    ', '
                    ORDER BY cc.order_index ASC, ch.name_ru ASC
                ) as characteristics_list
            FROM categories c
            LEFT JOIN category_characteristics cc ON cc.category_id = c.id
            LEFT JOIN characteristics ch ON ch.id = cc.characteristic_id
            WHERE c.parent_id IS NOT NULL
            GROUP BY c.id, c.slug, c.name_ru, c.name_uz, c.name_en, c.parent_id
            ORDER BY 
                (SELECT name_ru FROM categories WHERE id = c.parent_id) ASC,
                c.name_ru ASC
        `);

        const subcategories = result.rows;

        console.log(`📊 Jami subkategoriyalar: ${subcategories.length}\n`);

        // Detalizatsiya
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 SUBKATEGORIYALAR VA XARAKTERISTIKALAR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Parent kategoriyalar bo'yicha guruhlash
        const byParent: { [key: string]: typeof subcategories } = {};

        for (const sub of subcategories) {
            const parentName = sub.parent_name_ru || `Parent ID: ${sub.parent_id}`;
            if (!byParent[parentName]) {
                byParent[parentName] = [];
            }
            byParent[parentName].push(sub);
        }

        let totalCharacteristics = 0;
        let subcategoriesWith6Chars = 0;
        let subcategoriesWithOtherCount = 0;

        for (const [parentName, subs] of Object.entries(byParent)) {
            console.log(`\n📁 ${parentName} (${subs.length} ta subkategoriya):`);
            console.log('─'.repeat(70));
            
            for (const sub of subs) {
                const charCount = parseInt(String(sub.characteristic_count || '0'));
                const productCount = parseInt(String(sub.product_count || '0'));
                const status = productCount > 0 ? '✅' : '⚠️';
                
                console.log(`\n  ${status} ${sub.category_name_ru || sub.category_slug}`);
                console.log(`     ID: ${sub.category_id} | Slug: ${sub.category_slug}`);
                console.log(`     Mahsulotlar: ${productCount} | Xarakteristikalar: ${charCount}`);
                
                if (charCount > 0) {
                    console.log(`     Xarakteristikalar:`);
                    const chars = sub.characteristics_list?.split(', ') || [];
                    chars.forEach((char: string, idx: number) => {
                        console.log(`       ${idx + 1}. ${char}`);
                    });
                } else {
                    console.log(`     ⚠️  Xarakteristikalar yo'q`);
                }

                totalCharacteristics += charCount;
                if (charCount === 6) {
                    subcategoriesWith6Chars++;
                } else if (charCount > 0) {
                    subcategoriesWithOtherCount++;
                }
            }
        }

        // Statistika
        console.log('\n\n═══════════════════════════════════════════════════════════════');
        console.log('📊 STATISTIKA');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const subcategoriesWithChars = subcategories.filter((s: any) => 
            parseInt(String(s.characteristic_count || '0')) > 0
        ).length;
        const subcategoriesWithoutChars = subcategories.length - subcategoriesWithChars;

        console.log(`Jami subkategoriyalar: ${subcategories.length}`);
        console.log(`  - Xarakteristikalar bilan: ${subcategoriesWithChars}`);
        console.log(`  - Xarakteristikalar yo'q: ${subcategoriesWithoutChars}`);
        console.log(`\nXarakteristikalar soni bo'yicha:`);
        console.log(`  - Aynan 6 ta xarakteristika: ${subcategoriesWith6Chars} ta`);
        console.log(`  - Boshqa son (0 dan katta): ${subcategoriesWithOtherCount} ta`);
        console.log(`  - Jami xarakteristikalar bog'lanishlar: ${totalCharacteristics}`);

        // Har bir subkategoriyaga 6 tadan xarakteristika bo'lganlar ro'yxati
        if (subcategoriesWith6Chars > 0) {
            console.log(`\n\n═══════════════════════════════════════════════════════════════`);
            console.log('✅ AYNAN 6 TA XARAKTERISTIKA BILAN SUBKATEGORIYALAR');
            console.log('═══════════════════════════════════════════════════════════════\n');

            let index = 1;
            for (const sub of subcategories) {
                const charCount = parseInt(String(sub.characteristic_count || '0'));
                if (charCount === 6) {
                    console.log(`${index}. ${sub.category_name_ru || sub.category_slug}`);
                    console.log(`   Parent: ${sub.parent_name_ru || 'N/A'}`);
                    console.log(`   Slug: ${sub.category_slug}`);
                    console.log(`   Xarakteristikalar: ${sub.characteristics_list || 'N/A'}`);
                    console.log('');
                    index++;
                }
            }
        }

        // Barcha xarakteristikalar ro'yxati (unique)
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📝 BARCHA XARAKTERISTIKALAR RO\'YXATI (UNIQUE)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const allCharsResult = await client.query(`
            SELECT DISTINCT
                ch.id,
                ch.key,
                ch.name_ru,
                ch.name_uz,
                ch.name_en,
                ch.type,
                ch.is_filterable,
                COUNT(DISTINCT cc.category_id) as used_in_categories
            FROM characteristics ch
            LEFT JOIN category_characteristics cc ON cc.characteristic_id = ch.id
            LEFT JOIN categories c ON c.id = cc.category_id AND c.parent_id IS NOT NULL
            GROUP BY ch.id, ch.key, ch.name_ru, ch.name_uz, ch.name_en, ch.type, ch.is_filterable
            ORDER BY used_in_categories DESC, ch.name_ru ASC
        `);

        console.log(`Jami xarakteristikalar: ${allCharsResult.rows.length}\n`);

        for (const char of allCharsResult.rows) {
            const usedCount = parseInt(String(char.used_in_categories || '0'));
            const filterable = char.is_filterable ? '✅' : '❌';
            console.log(`- ${char.key} (${char.name_ru})`);
            console.log(`  Type: ${char.type} | Filterable: ${filterable}`);
            console.log(`  Ishlatilgan subkategoriyalarda: ${usedCount} ta`);
            console.log('');
        }

    } catch (e) {
        console.error('❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

listCategoryCharacteristics();

