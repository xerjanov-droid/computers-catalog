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

async function listEmptySubcategories() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Ichida mahsulot bo\'lmagan subkategoriyalar topilmoqda...\n');

        // Subkategoriyalarni olish (parent_id IS NOT NULL) va mahsulotlar sonini hisoblash
        const result = await client.query(`
            SELECT 
                c.id,
                c.parent_id,
                c.slug,
                c.name_ru,
                c.name_uz,
                c.name_en,
                c.order_index,
                c.is_active,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
                (SELECT name_ru FROM categories WHERE id = c.parent_id) as parent_name_ru
            FROM categories c
            WHERE c.parent_id IS NOT NULL
            ORDER BY 
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) ASC,
                c.name_ru ASC
        `);

        const allSubcategories = result.rows;
        const emptySubcategories = allSubcategories.filter((sub: any) => {
            const count = parseInt(String(sub.product_count || '0'));
            return count === 0;
        });

        console.log(`📊 Jami subkategoriyalar: ${allSubcategories.length}`);
        console.log(`📦 Ichida mahsulot bo'lmagan subkategoriyalar: ${emptySubcategories.length}\n`);

        if (emptySubcategories.length === 0) {
            console.log('✅ Barcha subkategoriyalarda kamida bitta mahsulot bor.');
            return;
        }

        // Natijalarni ko'rsatish
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📋 ICHIDA MAHSULOT BO\'LMAGAN SUBKATEGORIYALAR');
        console.log('═══════════════════════════════════════════════════════════════\n');

        // Parent kategoriyalar bo'yicha guruhlash
        const byParent: { [key: string]: typeof emptySubcategories } = {};

        for (const sub of emptySubcategories) {
            const parentName = sub.parent_name_ru || `Parent ID: ${sub.parent_id}`;
            if (!byParent[parentName]) {
                byParent[parentName] = [];
            }
            byParent[parentName].push(sub);
        }

        let index = 1;
        for (const [parentName, subs] of Object.entries(byParent)) {
            console.log(`\n📁 ${parentName} (${subs.length} ta):`);
            console.log('─'.repeat(60));
            
            for (const sub of subs) {
                const status = sub.is_active ? '✅' : '❌';
                console.log(`  ${index}. ${status} ID: ${sub.id} | Slug: ${sub.slug}`);
                console.log(`     RU: ${sub.name_ru || '-'}`);
                console.log(`     UZ: ${sub.name_uz || '-'}`);
                console.log(`     EN: ${sub.name_en || '-'}`);
                console.log(`     Order: ${sub.order_index || 0}`);
                console.log('');
                index++;
            }
        }

        // Statistika
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 STATISTIKA');
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        const activeEmpty = emptySubcategories.filter((s: any) => s.is_active).length;
        const inactiveEmpty = emptySubcategories.filter((s: any) => !s.is_active).length;
        
        console.log(`Jami bo'sh subkategoriyalar: ${emptySubcategories.length}`);
        console.log(`  - Faol (is_active = true): ${activeEmpty}`);
        console.log(`  - Nofaol (is_active = false): ${inactiveEmpty}`);

        // Parent kategoriyalar bo'yicha taqsimot
        console.log('\nParent kategoriyalar bo\'yicha taqsimot:');
        for (const [parentName, subs] of Object.entries(byParent)) {
            console.log(`  - ${parentName}: ${subs.length} ta`);
        }

    } catch (e) {
        console.error('❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

listEmptySubcategories();

