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

async function fixCategoryNames() {
    console.log('=== "Office Equipment" va "Storage Devices" kategoriyalarini 3 tilda to\'g\'rilash ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Update Office Equipment category
        console.log('📝 "Office Equipment" kategoriyasini yangilash...');
        const officeResult = await client.query(`
            UPDATE categories 
            SET 
                name_ru = 'Офисная техника',
                name_uz = 'Ofis texnikasi',
                name_en = 'Office Equipment'
            WHERE slug = 'office-equipment' OR slug = 'office_equipment'
            RETURNING id, slug, name_ru, name_uz, name_en
        `);
        
        if (officeResult.rows.length > 0) {
            const row = officeResult.rows[0];
            console.log(`✅ Yangilandi: [${row.id}] ${row.slug}`);
            console.log(`   RU: ${row.name_ru}`);
            console.log(`   UZ: ${row.name_uz}`);
            console.log(`   EN: ${row.name_en}\n`);
        } else {
            console.log('⚠️  "Office Equipment" kategoriyasi topilmadi\n');
        }

        // Update Storage Devices category
        console.log('📝 "Storage Devices" kategoriyasini yangilash...');
        const storageResult = await client.query(`
            UPDATE categories 
            SET 
                name_ru = 'Устройства хранения',
                name_uz = 'Saqlash qurilmalari',
                name_en = 'Storage Devices'
            WHERE slug = 'storage-devices' OR slug = 'storage_devices'
            RETURNING id, slug, name_ru, name_uz, name_en
        `);
        
        if (storageResult.rows.length > 0) {
            const row = storageResult.rows[0];
            console.log(`✅ Yangilandi: [${row.id}] ${row.slug}`);
            console.log(`   RU: ${row.name_ru}`);
            console.log(`   UZ: ${row.name_uz}`);
            console.log(`   EN: ${row.name_en}\n`);
        } else {
            console.log('⚠️  "Storage Devices" kategoriyasi topilmadi\n');
        }

        // Verify the changes
        console.log('📋 Tekshirish - yangilangan kategoriyalar:\n');
        const verify = await client.query(`
            SELECT id, slug, name_ru, name_uz, name_en 
            FROM categories 
            WHERE slug IN ('office-equipment', 'office_equipment', 'storage-devices', 'storage_devices')
            ORDER BY slug
        `);

        if (verify.rows.length > 0) {
            verify.rows.forEach((row: any) => {
                console.log(`  [${row.id}] ${row.slug}`);
                console.log(`      RU: ${row.name_ru}`);
                console.log(`      UZ: ${row.name_uz}`);
                console.log(`      EN: ${row.name_en}`);
                console.log('');
            });
        } else {
            console.log('  ⚠️  Hech qanday kategoriya topilmadi\n');
        }

        console.log('✅ Barcha o\'zgarishlar muvaffaqiyatli amalga oshirildi!\n');

    } catch (e: any) {
        console.error('❌ Xatolik:', e.message);
        if (e.detail) {
            console.error('   Detal: ', e.detail);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

fixCategoryNames();

