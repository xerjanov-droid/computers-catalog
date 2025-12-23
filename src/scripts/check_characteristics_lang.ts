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

async function checkCharacteristicsLanguages() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Xarakteristikalar til mosligini tekshirilmoqda...\n');

        // 1. Barcha xarakteristikalarni olish
        const allChars = await client.query(`
            SELECT 
                id,
                key,
                name_ru,
                name_uz,
                name_en,
                type,
                is_filterable,
                is_active
            FROM characteristics
            ORDER BY id ASC
        `);

        console.log(`📊 Jami xarakteristikalar: ${allChars.rows.length}\n`);

        // 2. Muammolarni topish
        const problems: any[] = [];

        for (const char of allChars.rows) {
            const issues: string[] = [];

            // NULL yoki bo'sh tekshirish
            if (!char.name_ru || char.name_ru.trim() === '') {
                issues.push('name_ru NULL yoki bo\'sh');
            }
            if (!char.name_uz || char.name_uz.trim() === '') {
                issues.push('name_uz NULL yoki bo\'sh');
            }
            if (!char.name_en || char.name_en.trim() === '') {
                issues.push('name_en NULL yoki bo\'sh');
            }

            // Bir xil bo'lganlarini tekshirish
            if (char.name_ru && char.name_en && char.name_ru === char.name_en) {
                issues.push('name_ru = name_en (bir xil)');
            }
            if (char.name_uz && char.name_en && char.name_uz === char.name_en) {
                issues.push('name_uz = name_en (bir xil)');
            }
            if (char.name_ru && char.name_uz && char.name_ru === char.name_uz) {
                issues.push('name_ru = name_uz (bir xil)');
            }

            if (issues.length > 0) {
                problems.push({
                    id: char.id,
                    key: char.key,
                    name_ru: char.name_ru || '(NULL)',
                    name_uz: char.name_uz || '(NULL)',
                    name_en: char.name_en || '(NULL)',
                    type: char.type,
                    issues: issues
                });
            }
        }

        // 3. Natijalarni ko'rsatish
        if (problems.length === 0) {
            console.log('✅ Barcha xarakteristikalar 3 tilga mos!');
            return;
        }

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('⚠️  MUAMMOLI XARAKTERISTIKALAR');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log(`Jami muammoli xarakteristikalar: ${problems.length}\n`);

        for (const problem of problems) {
            console.log(`❌ ID: ${problem.id} | Key: ${problem.key}`);
            console.log(`   RU: ${problem.name_ru}`);
            console.log(`   UZ: ${problem.name_uz}`);
            console.log(`   EN: ${problem.name_en}`);
            console.log(`   Type: ${problem.type}`);
            console.log(`   Muammolar:`);
            problem.issues.forEach((issue: string) => {
                console.log(`     - ${issue}`);
            });
            console.log('');
        }

        // 4. Statistika
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📊 STATISTIKA');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const stats = await client.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN name_ru IS NULL OR name_ru = '' THEN 1 END) as missing_ru,
                COUNT(CASE WHEN name_uz IS NULL OR name_uz = '' THEN 1 END) as missing_uz,
                COUNT(CASE WHEN name_en IS NULL OR name_en = '' THEN 1 END) as missing_en,
                COUNT(CASE WHEN name_ru = name_en THEN 1 END) as ru_same_as_en,
                COUNT(CASE WHEN name_uz = name_en THEN 1 END) as uz_same_as_en,
                COUNT(CASE WHEN name_ru = name_uz THEN 1 END) as ru_same_as_uz
            FROM characteristics
        `);

        const stat = stats.rows[0];
        console.log(`Jami xarakteristikalar: ${stat.total}`);
        console.log(`  - name_ru yo'q: ${stat.missing_ru}`);
        console.log(`  - name_uz yo'q: ${stat.missing_uz}`);
        console.log(`  - name_en yo'q: ${stat.missing_en}`);
        console.log(`  - name_ru = name_en: ${stat.ru_same_as_en}`);
        console.log(`  - name_uz = name_en: ${stat.uz_same_as_en}`);
        console.log(`  - name_ru = name_uz: ${stat.ru_same_as_uz}`);

        // 5. To'liq ro'yxat (muammosizlar)
        const goodChars = allChars.rows.filter((char: any) => {
            const hasIssues = problems.some((p: any) => p.id === char.id);
            return !hasIssues;
        });

        if (goodChars.length > 0) {
            console.log(`\n✅ To'liq tarjima qilingan xarakteristikalar: ${goodChars.length} ta`);
        }

        // 6. Muammolarni kategoriyalar bo'yicha guruhlash
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📋 MUAMMOLAR TURI BO\'YICHA');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const missingRu = problems.filter((p: any) => p.issues.some((i: string) => i.includes('name_ru')));
        const missingUz = problems.filter((p: any) => p.issues.some((i: string) => i.includes('name_uz')));
        const missingEn = problems.filter((p: any) => p.issues.some((i: string) => i.includes('name_en')));
        const sameRuEn = problems.filter((p: any) => p.issues.some((i: string) => i.includes('name_ru = name_en')));
        const sameUzEn = problems.filter((p: any) => p.issues.some((i: string) => i.includes('name_uz = name_en')));
        const sameRuUz = problems.filter((p: any) => p.issues.some((i: string) => i.includes('name_ru = name_uz')));

        if (missingRu.length > 0) {
            console.log(`\n❌ name_ru yo'q (${missingRu.length} ta):`);
            missingRu.forEach((p: any) => {
                console.log(`   - ${p.key} (ID: ${p.id})`);
            });
        }

        if (missingUz.length > 0) {
            console.log(`\n❌ name_uz yo'q (${missingUz.length} ta):`);
            missingUz.forEach((p: any) => {
                console.log(`   - ${p.key} (ID: ${p.id})`);
            });
        }

        if (missingEn.length > 0) {
            console.log(`\n❌ name_en yo'q (${missingEn.length} ta):`);
            missingEn.forEach((p: any) => {
                console.log(`   - ${p.key} (ID: ${p.id})`);
            });
        }

        if (sameRuEn.length > 0) {
            console.log(`\n⚠️  name_ru = name_en (${sameRuEn.length} ta):`);
            sameRuEn.forEach((p: any) => {
                console.log(`   - ${p.key} (ID: ${p.id}): "${p.name_ru}"`);
            });
        }

        if (sameUzEn.length > 0) {
            console.log(`\n⚠️  name_uz = name_en (${sameUzEn.length} ta):`);
            sameUzEn.forEach((p: any) => {
                console.log(`   - ${p.key} (ID: ${p.id}): "${p.name_uz}"`);
            });
        }

        if (sameRuUz.length > 0) {
            console.log(`\n⚠️  name_ru = name_uz (${sameRuUz.length} ta):`);
            sameRuUz.forEach((p: any) => {
                console.log(`   - ${p.key} (ID: ${p.id}): "${p.name_ru}"`);
            });
        }

    } catch (e) {
        console.error('❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

checkCharacteristicsLanguages();

