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

async function updateExistingSubcategories() {
    console.log('=== Mavjud subkategoriyalarni yangilash ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Eski subkategoriyalarni yangilash (slug'lar bilan)
        const updateQuery = `
            UPDATE categories SET
                name_ru = CASE slug
                    WHEN 'office-pc' THEN 'Офисные ПК'
                    WHEN 'gaming-pc' THEN 'Игровые ПК'
                    WHEN 'workstations' THEN 'Рабочие станции'
                    WHEN 'mini-pc' THEN 'Мини ПК'
                    WHEN 'office-laptops' THEN 'Офисные ноутбуки'
                    WHEN 'gaming-laptops' THEN 'Игровые ноутбуки'
                    WHEN 'ultrabooks' THEN 'Ультрабуки'
                    WHEN 'office-monitors' THEN 'Офисные мониторы'
                    WHEN 'gaming-monitors' THEN 'Игровые мониторы'
                    WHEN 'ultrawide-monitors' THEN 'Сверхширокие'
                    WHEN 'cpu' THEN 'Процессоры'
                    WHEN 'gpu' THEN 'Видеокарты'
                    WHEN 'motherboards' THEN 'Материнские платы'
                    WHEN 'ram' THEN 'Оперативная память'
                    WHEN 'psu' THEN 'Блоки питания'
                    WHEN 'cooling' THEN 'Охлаждение'
                    WHEN 'cases' THEN 'Корпуса'
                    WHEN 'keyboards' THEN 'Клавиатуры'
                    WHEN 'mice' THEN 'Мыши'
                    WHEN 'headsets' THEN 'Гарнитуры'
                    WHEN 'webcams' THEN 'Веб-камеры'
                    WHEN 'microphones' THEN 'Микрофоны'
                    WHEN 'gamepads' THEN 'Геймпады'
                    WHEN 'printers' THEN 'Принтеры'
                    WHEN 'mfp' THEN 'МФУ'
                    WHEN 'scanners' THEN 'Сканеры'
                    WHEN 'ups' THEN 'ИБП'
                    WHEN 'laminators' THEN 'Ламинаторы'
                    WHEN 'shredders' THEN 'Шредеры'
                    WHEN 'routers' THEN 'Роутеры'
                    WHEN 'switches' THEN 'Свитчи'
                    WHEN 'access-points' THEN 'Точки доступа'
                    WHEN 'modems' THEN 'Модемы'
                    WHEN 'external-hdd' THEN 'Внешние HDD'
                    WHEN 'external-ssd' THEN 'Внешние SSD'
                    WHEN 'usb-flash' THEN 'USB флешки'
                    WHEN 'nas' THEN 'NAS'
                    WHEN 'card-readers' THEN 'Кардридеры'
                    WHEN 'bags' THEN 'Сумки'
                    WHEN 'cooling-pads' THEN 'Охлаждающие подставки'
                    WHEN 'cables' THEN 'Кабели'
                    WHEN 'chargers' THEN 'Зарядные устройства'
                    WHEN 'ups-batteries' THEN 'Батареи для ИБП'
                    WHEN 'antivirus' THEN 'Антивирусы'
                    WHEN 'accounting' THEN 'Бухгалтерия'
                    ELSE name_ru
                END,
                name_uz = CASE slug
                    WHEN 'office-pc' THEN 'Ofis kompyuterlari'
                    WHEN 'gaming-pc' THEN 'O''yin kompyuterlari'
                    WHEN 'workstations' THEN 'Workstationlar'
                    WHEN 'mini-pc' THEN 'Mini kompyuterlar'
                    WHEN 'office-laptops' THEN 'Ofis noutbuklari'
                    WHEN 'gaming-laptops' THEN 'O''yin noutbuklari'
                    WHEN 'ultrabooks' THEN 'Ultrabuklar'
                    WHEN 'office-monitors' THEN 'Ofis monitorlari'
                    WHEN 'gaming-monitors' THEN 'O''yin monitorlari'
                    WHEN 'ultrawide-monitors' THEN 'Ultra keng'
                    WHEN 'cpu' THEN 'Protsessorlar'
                    WHEN 'gpu' THEN 'Video kartalar'
                    WHEN 'motherboards' THEN 'Ana kartalar'
                    WHEN 'ram' THEN 'Operativ xotira'
                    WHEN 'psu' THEN 'Quvvat manbalari'
                    WHEN 'cooling' THEN 'Sovutish'
                    WHEN 'cases' THEN 'Korpuslar'
                    WHEN 'keyboards' THEN 'Klaviaturalar'
                    WHEN 'mice' THEN 'Sichqonchalar'
                    WHEN 'headsets' THEN 'Garnituralar'
                    WHEN 'webcams' THEN 'Veb-kameralar'
                    WHEN 'microphones' THEN 'Mikrofonlar'
                    WHEN 'gamepads' THEN 'O''yin kontrollerlari'
                    WHEN 'printers' THEN 'Printerlar'
                    WHEN 'mfp' THEN 'MFP'
                    WHEN 'scanners' THEN 'Skannerlar'
                    WHEN 'ups' THEN 'UPS'
                    WHEN 'laminators' THEN 'Laminatorlar'
                    WHEN 'shredders' THEN 'Shredderlar'
                    WHEN 'routers' THEN 'Routerlar'
                    WHEN 'switches' THEN 'Switchlar'
                    WHEN 'access-points' THEN 'Kirish nuqtalari'
                    WHEN 'modems' THEN 'Modemlar'
                    WHEN 'external-hdd' THEN 'Tashqi HDD'
                    WHEN 'external-ssd' THEN 'Tashqi SSD'
                    WHEN 'usb-flash' THEN 'USB fleshkalar'
                    WHEN 'nas' THEN 'NAS'
                    WHEN 'card-readers' THEN 'Karta o''qish qurilmalari'
                    WHEN 'bags' THEN 'Sumkalar'
                    WHEN 'cooling-pads' THEN 'Sovutish podstavkalari'
                    WHEN 'cables' THEN 'Kabellar'
                    WHEN 'chargers' THEN 'Zaryadlovchi qurilmalar'
                    WHEN 'ups-batteries' THEN 'UPS batareyalari'
                    WHEN 'antivirus' THEN 'Antiviruslar'
                    WHEN 'accounting' THEN 'Buxgalteriya'
                    ELSE name_uz
                END
            WHERE slug IN (
                'office-pc', 'gaming-pc', 'workstations', 'mini-pc',
                'office-laptops', 'gaming-laptops', 'ultrabooks',
                'office-monitors', 'gaming-monitors', 'ultrawide-monitors',
                'cpu', 'gpu', 'motherboards', 'ram', 'psu', 'cooling', 'cases',
                'keyboards', 'mice', 'headsets', 'webcams', 'microphones', 'gamepads',
                'printers', 'mfp', 'scanners', 'ups', 'laminators', 'shredders',
                'routers', 'switches', 'access-points', 'modems',
                'external-hdd', 'external-ssd', 'usb-flash', 'nas', 'card-readers',
                'bags', 'cooling-pads', 'cables', 'chargers', 'ups-batteries',
                'antivirus', 'accounting'
            );
        `;

        console.log('📝 Mavjud subkategoriyalarni yangilash...');
        const result = await client.query(updateQuery);
        console.log(`✅ ${result.rowCount || 0} ta subkategoriya yangilandi\n`);

        // Yangilangan kategoriyalarni ko'rsatish
        const updated = await client.query(`
            SELECT id, slug, name_en, name_ru, name_uz
            FROM categories
            WHERE slug IN (
                'office-pc', 'gaming-pc', 'workstations', 'mini-pc',
                'office-laptops', 'gaming-laptops', 'ultrabooks'
            )
            ORDER BY slug
            LIMIT 10
        `);

        console.log('📋 Yangilangan subkategoriyalar (namuna):\n');
        updated.rows.forEach((row: any) => {
            console.log(`  [${row.id}] ${row.slug}`);
            console.log(`      EN: ${row.name_en}`);
            console.log(`      RU: ${row.name_ru}`);
            console.log(`      UZ: ${row.name_uz}`);
            console.log('');
        });

        console.log('✅ Barcha mavjud subkategoriyalar muvaffaqiyatli yangilandi!\n');

    } catch (e: any) {
        console.error('❌ Xatolik:', e.message);
        if (e.detail) {
            console.error('   Detal: ', e.detail);
        }
    } finally {
        await client.end();
    }
}

updateExistingSubcategories();

