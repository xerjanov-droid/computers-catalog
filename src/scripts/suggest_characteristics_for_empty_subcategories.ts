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

// Xarakteristikalar takliflari
const suggestions: { [key: string]: Array<{ key: string; name_ru: string; name_uz: string; name_en: string; type: string; is_filterable: boolean }> } = {
    'licenses': [
        {
            key: 'license_type',
            name_ru: 'Тип лицензии',
            name_uz: 'Litsenziya turi',
            name_en: 'License Type',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'validity_period',
            name_ru: 'Срок действия',
            name_uz: 'Amal qilish muddati',
            name_en: 'Validity Period',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'devices_count',
            name_ru: 'Количество устройств',
            name_uz: 'Qurilmalar soni',
            name_en: 'Devices Count',
            type: 'number',
            is_filterable: true
        },
        {
            key: 'activation_method',
            name_ru: 'Способ активации',
            name_uz: 'Faollashtirish usuli',
            name_en: 'Activation Method',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'support_period',
            name_ru: 'Период поддержки',
            name_uz: 'Qo\'llab-quvvatlash muddati',
            name_en: 'Support Period',
            type: 'select',
            is_filterable: false
        },
        {
            key: 'updates_included',
            name_ru: 'Обновления включены',
            name_uz: 'Yangilanishlar kiritilgan',
            name_en: 'Updates Included',
            type: 'boolean',
            is_filterable: true
        }
    ],
    'wifi-adapters': [
        {
            key: 'wifi_standard',
            name_ru: 'Wi-Fi стандарт',
            name_uz: 'Wi-Fi standarti',
            name_en: 'Wi-Fi Standard',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'max_speed',
            name_ru: 'Максимальная скорость',
            name_uz: 'Maksimal tezlik',
            name_en: 'Max Speed',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'frequency_bands',
            name_ru: 'Частотные диапазоны',
            name_uz: 'Chastota diapazonlari',
            name_en: 'Frequency Bands',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'interface',
            name_ru: 'Интерфейс подключения',
            name_uz: 'Ulanish interfeysi',
            name_en: 'Interface',
            type: 'select',
            is_filterable: true
        },
        {
            key: 'antenna_type',
            name_ru: 'Тип антенны',
            name_uz: 'Antenna turi',
            name_en: 'Antenna Type',
            type: 'select',
            is_filterable: false
        },
        {
            key: 'compatibility',
            name_ru: 'Совместимость',
            name_uz: 'Mos keluvchanlik',
            name_en: 'Compatibility',
            type: 'text',
            is_filterable: false
        }
    ]
};

async function suggestCharacteristics() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Xarakteristikalar yo\'q bo\'lgan subkategoriyalarni topilmoqda...\n');

        // Subkategoriyalarni topish
        const result = await client.query(`
            SELECT 
                c.id,
                c.slug,
                c.name_ru,
                c.name_uz,
                c.name_en,
                (SELECT COUNT(*) FROM category_characteristics cc WHERE cc.category_id = c.id) as characteristic_count,
                (SELECT name_ru FROM categories WHERE id = c.parent_id) as parent_name_ru
            FROM categories c
            WHERE c.parent_id IS NOT NULL
                AND (SELECT COUNT(*) FROM category_characteristics cc WHERE cc.category_id = c.id) = 0
            ORDER BY c.name_ru ASC
        `);

        const emptySubcategories = result.rows;

        if (emptySubcategories.length === 0) {
            console.log('✅ Xarakteristikalar yo\'q bo\'lgan subkategoriyalar topilmadi.');
            return;
        }

        console.log(`📦 Topilgan subkategoriyalar: ${emptySubcategories.length}\n`);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('💡 XARAKTERISTIKALAR TAKLIFLARI');
        console.log('═══════════════════════════════════════════════════════════════\n');

        for (const sub of emptySubcategories) {
            const slug = sub.slug;
            const suggestionsForSub = suggestions[slug] || [];

            if (suggestionsForSub.length === 0) {
                console.log(`⚠️  "${sub.name_ru}" (${slug}) uchun takliflar topilmadi.\n`);
                continue;
            }

            console.log(`\n📁 ${sub.name_ru} (${sub.slug})`);
            console.log(`   Parent: ${sub.parent_name_ru || 'N/A'}`);
            console.log(`   ID: ${sub.id}`);
            console.log('   ─'.repeat(60));
            console.log(`   💡 Taklif qilinayotgan xarakteristikalar (${suggestionsForSub.length} ta):\n`);

            suggestionsForSub.forEach((char, index) => {
                const filterable = char.is_filterable ? '✅ Filterable' : '❌ Not filterable';
                console.log(`   ${index + 1}. ${char.name_ru} (${char.key})`);
                console.log(`      RU: ${char.name_ru}`);
                console.log(`      UZ: ${char.name_uz}`);
                console.log(`      EN: ${char.name_en}`);
                console.log(`      Type: ${char.type} | ${filterable}`);
                console.log('');
            });
        }

        // SQL script generatsiya
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📝 SQL SCRIPT (Xarakteristikalar yaratish va bog\'lash)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('-- Xarakteristikalar yaratish va subkategoriyalarga bog\'lash\n');

        for (const sub of emptySubcategories) {
            const slug = sub.slug;
            const suggestionsForSub = suggestions[slug] || [];

            if (suggestionsForSub.length === 0) continue;

            console.log(`-- ${sub.name_ru} (ID: ${sub.id}, Slug: ${slug})\n`);

            suggestionsForSub.forEach((char, index) => {
                // Xarakteristika yaratish
                console.log(`-- ${index + 1}. ${char.name_ru}`);
                console.log(`INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_filterable, is_active)`);
                console.log(`VALUES ('${char.key}', '${char.name_ru}', '${char.name_uz}', '${char.name_en}', '${char.type}', ${char.is_filterable}, true)`);
                console.log(`ON CONFLICT (key) DO UPDATE SET name_ru = EXCLUDED.name_ru, name_uz = EXCLUDED.name_uz, name_en = EXCLUDED.name_en;`);
                console.log('');

                // Subkategoriyaga bog'lash
                console.log(`INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)`);
                console.log(`SELECT ${sub.id}, c.id, false, false, ${index}`);
                console.log(`FROM characteristics c WHERE c.key = '${char.key}'`);
                console.log(`ON CONFLICT (category_id, characteristic_id) DO NOTHING;`);
                console.log('');
            });
        }

        // TypeScript script generatsiya
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('📝 TYPESCRIPT SCRIPT (Xarakteristikalar yaratish va bog\'lash)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        console.log('import { Pool } from \'pg\';\n');
        console.log('// ... database connection setup ...\n');
        console.log('async function createAndLinkCharacteristics() {');
        console.log('    const client = await pool.connect();');
        console.log('    try {');

        for (const sub of emptySubcategories) {
            const slug = sub.slug;
            const suggestionsForSub = suggestions[slug] || [];

            if (suggestionsForSub.length === 0) continue;

            console.log(`\n        // ${sub.name_ru} (ID: ${sub.id})`);
            
            for (const char of suggestionsForSub) {
                console.log(`        // Creating: ${char.name_ru}`);
                console.log(`        const char_${char.key} = await client.query(`);
                console.log(`            \`INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_filterable, is_active)`);
                console.log(`            VALUES ($1, $2, $3, $4, $5, $6, true)`);
                console.log(`            ON CONFLICT (key) DO UPDATE SET name_ru = EXCLUDED.name_ru, name_uz = EXCLUDED.name_uz, name_en = EXCLUDED.name_en`);
                console.log(`            RETURNING id\`,`);
                console.log(`            ['${char.key}', '${char.name_ru}', '${char.name_uz}', '${char.name_en}', '${char.type}', ${char.is_filterable}]`);
                console.log(`        );`);
                console.log(`        const char_${char.key}_id = char_${char.key}.rows[0].id;`);
                console.log('');
            }

            console.log(`        // Linking to ${sub.name_ru}`);
            suggestionsForSub.forEach((char, index) => {
                console.log(`        await client.query(`);
                console.log(`            'INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index) VALUES ($1, $2, false, false, $3) ON CONFLICT DO NOTHING',`);
                console.log(`            [${sub.id}, char_${char.key}_id, ${index}]`);
                console.log(`        );`);
            });
        }

        console.log('\n        console.log(\'✅ Xarakteristikalar muvaffaqiyatli yaratildi va bog\'landi\');');
        console.log('    } catch (e) {');
        console.log('        console.error(\'❌ Xatolik:\', e);');
        console.log('    } finally {');
        console.log('        client.release();');
        console.log('        await pool.end();');
        console.log('    }');
        console.log('}');

    } catch (e) {
        console.error('❌ Xatolik:', e);
        throw e;
    } finally {
        client.release();
        await pool.end();
    }
}

suggestCharacteristics();

