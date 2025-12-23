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

async function createAndLinkCharacteristics() {
    const client = await pool.connect();
    try {
        console.log('🚀 Xarakteristikalar yaratilmoqda va subkategoriyalarga bog\'lanmoqda...\n');

        // Wi-Fi адаптеры (ID: 47)
        console.log('📁 Wi-Fi адаптеры (ID: 47)\n');
        
        const wifiChars = [
            { key: 'wifi_standard', name_ru: 'Wi-Fi стандарт', name_uz: 'Wi-Fi standarti', name_en: 'Wi-Fi Standard', type: 'select', is_filterable: true },
            { key: 'max_speed', name_ru: 'Максимальная скорость', name_uz: 'Maksimal tezlik', name_en: 'Max Speed', type: 'select', is_filterable: true },
            { key: 'frequency_bands', name_ru: 'Частотные диапазоны', name_uz: 'Chastota diapazonlari', name_en: 'Frequency Bands', type: 'select', is_filterable: true },
            { key: 'interface', name_ru: 'Интерфейс подключения', name_uz: 'Ulanish interfeysi', name_en: 'Interface', type: 'select', is_filterable: true },
            { key: 'antenna_type', name_ru: 'Тип антенны', name_uz: 'Antenna turi', name_en: 'Antenna Type', type: 'select', is_filterable: false },
            { key: 'compatibility', name_ru: 'Совместимость', name_uz: 'Mos keluvchanlik', name_en: 'Compatibility', type: 'text', is_filterable: false }
        ];

        for (let i = 0; i < wifiChars.length; i++) {
            const char = wifiChars[i];
            console.log(`  ${i + 1}. ${char.name_ru} (${char.key})`);
            
            const charRes = await client.query(
                `INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_filterable, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, true)
                ON CONFLICT (key) DO UPDATE SET name_ru = EXCLUDED.name_ru, name_uz = EXCLUDED.name_uz, name_en = EXCLUDED.name_en
                RETURNING id`,
                [char.key, char.name_ru, char.name_uz, char.name_en, char.type, char.is_filterable]
            );
            const charId = charRes.rows[0].id;

            await client.query(
                'INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index) VALUES ($1, $2, false, false, $3) ON CONFLICT (category_id, characteristic_id) DO NOTHING',
                [47, charId, i]
            );
        }

        console.log('  ✅ Wi-Fi адаптеры uchun xarakteristikalar yaratildi va bog\'landi\n');

        // Лицензии (ID: 65)
        console.log('📁 Лицензии (ID: 65)\n');
        
        const licenseChars = [
            { key: 'license_type', name_ru: 'Тип лицензии', name_uz: 'Litsenziya turi', name_en: 'License Type', type: 'select', is_filterable: true },
            { key: 'validity_period', name_ru: 'Срок действия', name_uz: 'Amal qilish muddati', name_en: 'Validity Period', type: 'select', is_filterable: true },
            { key: 'devices_count', name_ru: 'Количество устройств', name_uz: 'Qurilmalar soni', name_en: 'Devices Count', type: 'number', is_filterable: true },
            { key: 'activation_method', name_ru: 'Способ активации', name_uz: 'Faollashtirish usuli', name_en: 'Activation Method', type: 'select', is_filterable: true },
            { key: 'support_period', name_ru: 'Период поддержки', name_uz: 'Qo\'llab-quvvatlash muddati', name_en: 'Support Period', type: 'select', is_filterable: false },
            { key: 'updates_included', name_ru: 'Обновления включены', name_uz: 'Yangilanishlar kiritilgan', name_en: 'Updates Included', type: 'boolean', is_filterable: true }
        ];

        for (let i = 0; i < licenseChars.length; i++) {
            const char = licenseChars[i];
            console.log(`  ${i + 1}. ${char.name_ru} (${char.key})`);
            
            const charRes = await client.query(
                `INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_filterable, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, true)
                ON CONFLICT (key) DO UPDATE SET name_ru = EXCLUDED.name_ru, name_uz = EXCLUDED.name_uz, name_en = EXCLUDED.name_en
                RETURNING id`,
                [char.key, char.name_ru, char.name_uz, char.name_en, char.type, char.is_filterable]
            );
            const charId = charRes.rows[0].id;

            await client.query(
                'INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index) VALUES ($1, $2, false, false, $3) ON CONFLICT (category_id, characteristic_id) DO NOTHING',
                [65, charId, i]
            );
        }

        console.log('  ✅ Лицензии uchun xarakteristikalar yaratildi va bog\'landi\n');

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('✅ MUVAFFAQIYATLI!');
        console.log('═══════════════════════════════════════════════════════════════\n');
        console.log('📊 Natija:');
        console.log(`  - Wi-Fi адаптеры: ${wifiChars.length} ta xarakteristika`);
        console.log(`  - Лицензии: ${licenseChars.length} ta xarakteristika`);
        console.log(`  - Jami: ${wifiChars.length + licenseChars.length} ta xarakteristika yaratildi va bog'landi`);

    } catch (e) {
        console.error('\n❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

createAndLinkCharacteristics();

