
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

async function seed() {
    await client.connect();
    console.log('Connected to DB. Clearing old categories...');

    try {
        // Clear products and categories to ensure clean slate
        await client.query('TRUNCATE products, categories, product_specs, product_images, favorites RESTART IDENTITY CASCADE');

        const taxonomy = [
            {
                name_ru: 'Компьютеры', name_uz: 'Kompyuterlar', name_en: 'Computers', icon: '/images/category_computers.png',
                subs: [
                    { name_ru: 'Офисные ПК', name_uz: 'Stol kompyuterlari (Office)', name_en: 'Office PC' },
                    { name_ru: 'Игровые ПК', name_uz: 'Stol kompyuterlari (Gaming)', name_en: 'Gaming PC' },
                    { name_ru: 'Рабочие станции', name_uz: 'Workstation', name_en: 'Workstations' },
                    { name_ru: 'Моноблоки', name_uz: 'Monobloklar', name_en: 'All-in-One' },
                    { name_ru: 'Мини ПК', name_uz: 'Mini PC', name_en: 'Mini PC' },
                ]
            },
            {
                name_ru: 'Ноутбуки', name_uz: 'Noutbuklar', name_en: 'Laptops', icon: '/images/category_laptops.png',
                subs: [
                    { name_ru: 'Офисные ноутбуки', name_uz: 'Office noutbuklar', name_en: 'Office Laptops' },
                    { name_ru: 'Игровые ноутбуки', name_uz: 'Gaming noutbuklar', name_en: 'Gaming Laptops' },
                    { name_ru: 'Бизнес класс', name_uz: 'Biznes klass', name_en: 'Business Class' },
                    { name_ru: 'Ультрабуки', name_uz: 'Ultrabook', name_en: 'Ultrabooks' },
                    { name_ru: 'Трансформеры 2-в-1', name_uz: 'Transformerlari (2-in-1)', name_en: '2-in-1' },
                ]
            },
            {
                name_ru: 'Мониторы', name_uz: 'Monitorlar', name_en: 'Monitors', icon: '/images/category_monitors.png',
                subs: [
                    { name_ru: 'Офисные мониторы', name_uz: 'Office monitorlar', name_en: 'Office Monitors' },
                    { name_ru: 'Игровые мониторы', name_uz: 'Gaming monitorlar', name_en: 'Gaming Monitors' },
                    { name_ru: 'Профессиональные', name_uz: 'Professional (Design / Video)', name_en: 'Professional' },
                    { name_ru: 'Ultrawide', name_uz: 'Ultrawide', name_en: 'Ultrawide' },
                    { name_ru: 'Портативные', name_uz: 'Portable monitorlar', name_en: 'Portable' },
                ]
            },
            {
                name_ru: 'Компоненты', name_uz: 'Komponentlar', name_en: 'Components', icon: '⚙️',
                subs: [
                    { name_ru: 'Процессоры (CPU)', name_uz: 'Protsessorlar (CPU)', name_en: 'CPU' },
                    { name_ru: 'Видеокарты (GPU)', name_uz: 'Video kartalar (GPU)', name_en: 'GPU' },
                    { name_ru: 'Материнские платы', name_uz: 'Ona platalar (Motherboard)', name_en: 'Motherboards' },
                    { name_ru: 'Оперативная память (RAM)', name_uz: 'Operativ xotira (RAM)', name_en: 'RAM' },
                    { name_ru: 'SSD / HDD', name_uz: 'SSD / HDD', name_en: 'Storage' },
                    { name_ru: 'Блоки питания', name_uz: 'Quvvat bloklari (PSU)', name_en: 'PSU' },
                    { name_ru: 'Охлаждение', name_uz: 'Sovutish tizimlari', name_en: 'Cooling' },
                    { name_ru: 'Корпуса', name_uz: 'Korpuslar', name_en: 'Cases' },
                ]
            },
            {
                name_ru: 'Периферия', name_uz: 'Periferiya', name_en: 'Peripherals', icon: '/images/category_peripherals.png',
                subs: [
                    { name_ru: 'Клавиатуры', name_uz: 'Klaviaturalar', name_en: 'Keyboards' },
                    { name_ru: 'Мыши', name_uz: 'Sichqonchalar', name_en: 'Mice' },
                    { name_ru: 'Гарнитуры', name_uz: 'Quloqchin / Garnitura', name_en: 'Headsets' },
                    { name_ru: 'Веб-камеры', name_uz: 'Veb-kameralar', name_en: 'Webcams' },
                    { name_ru: 'Микрофоны', name_uz: 'Mikrofonlar', name_en: 'Microphones' },
                    { name_ru: 'Геймпады', name_uz: 'Joystick / Gamepad', name_en: 'Gamepads' },
                ]
            },
            {
                name_ru: 'Офисная техника', name_uz: 'Ofis texnikasi', name_en: 'Office Equipment', icon: '/images/category_printers.png',
                subs: [
                    { name_ru: 'Принтеры', name_uz: 'Printerlar', name_en: 'Printers' },
                    { name_ru: 'МФУ', name_uz: 'MFP (МФУ)', name_en: 'MFP' },
                    { name_ru: 'Сканеры', name_uz: 'Skanerlar', name_en: 'Scanners' },
                    { name_ru: 'ИБП (UPS)', name_uz: 'UPS (ИБП)', name_en: 'UPS' },
                    { name_ru: 'Ламинаторы', name_uz: 'Laminatorlar', name_en: 'Laminators' },
                    { name_ru: 'Шредеры', name_uz: 'Shredderlar', name_en: 'Shredders' },
                ]
            },
            {
                name_ru: 'Сетевое оборудование', name_uz: 'Tarmoq uskunalari', name_en: 'Networking', icon: '/images/category_networking.png',
                subs: [
                    { name_ru: 'Роутеры', name_uz: 'Routerlar', name_en: 'Routers' },
                    { name_ru: 'Коммутаторы', name_uz: 'Switchlar', name_en: 'Switches' },
                    { name_ru: 'Точки доступа', name_uz: 'Access Point', name_en: 'Access Points' },
                    { name_ru: 'Модемы', name_uz: 'Modemlar', name_en: 'Modems' },
                    { name_ru: 'Wi-Fi адаптеры', name_uz: 'Wi-Fi adapterlar', name_en: 'Wi-Fi Adapters' },
                ]
            },
            {
                name_ru: 'Накопители', name_uz: 'Saqlash qurilmalari', name_en: 'Storage Devices', icon: '💾',
                subs: [
                    { name_ru: 'Внешние HDD', name_uz: 'Tashqi HDD', name_en: 'External HDD' },
                    { name_ru: 'Внешние SSD', name_uz: 'Tashqi SSD', name_en: 'External SSD' },
                    { name_ru: 'USB Flash', name_uz: 'USB Flash', name_en: 'USB Flash' },
                    { name_ru: 'NAS', name_uz: 'NAS', name_en: 'NAS' },
                    { name_ru: 'Card Reader', name_uz: 'Card Reader', name_en: 'Card Readers' },
                ]
            },
            {
                name_ru: 'Аксессуары', name_uz: 'Aksessuarlar', name_en: 'Accessories', icon: '🎒',
                subs: [
                    { name_ru: 'Сумки и рюкзаки', name_uz: 'Sumkalar va ryukzaklar', name_en: 'Bags' },
                    { name_ru: 'Подставки', name_uz: 'Sovutish tagliklari', name_en: 'Cooling Pads' },
                    { name_ru: 'Кабели', name_uz: 'Kabel va adapterlar', name_en: 'Cables' },
                    { name_ru: 'Зарядные устройства', name_uz: 'Zaryadlovchilar', name_en: 'Chargers' },
                    { name_ru: 'Батареи для ИБП', name_uz: 'UPS batareyalari', name_en: 'UPS Batteries' },
                ]
            },
            {
                name_ru: 'ПО', name_uz: 'Dasturiy ta’minot', name_en: 'Software', icon: '💿',
                subs: [
                    { name_ru: 'Windows', name_uz: 'Operatsion tizimlar (Windows)', name_en: 'OS' },
                    { name_ru: 'Office', name_uz: 'Office paketlar', name_en: 'Office Suites' },
                    { name_ru: 'Антивирусы', name_uz: 'Antiviruslar', name_en: 'Antivirus' },
                    { name_ru: 'Бухгалтерия', name_uz: 'Buxgalteriya dasturlari', name_en: 'Accounting' },
                    { name_ru: 'Лицензии', name_uz: 'Litsenziya kalitlari', name_en: 'Keys' },
                ]
            },
        ];

        let orderIndex = 1;
        for (const mainCat of taxonomy) {
            // Insert Main Category
            const mainRes = await client.query(
                `INSERT INTO categories (name_ru, name_uz, name_en, icon, order_index, is_active) 
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
                [mainCat.name_ru, mainCat.name_uz, mainCat.name_en, mainCat.icon, orderIndex++]
            );
            const parentId = mainRes.rows[0].id;

            // Insert Sub Categories
            let subOrder = 1;
            for (const subCat of mainCat.subs) {
                await client.query(
                    `INSERT INTO categories (parent_id, name_ru, name_uz, name_en, order_index, is_active) 
           VALUES ($1, $2, $3, $4, $5, true)`,
                    [parentId, subCat.name_ru, subCat.name_uz, subCat.name_en, subOrder++]
                );
            }
        }

        console.log('Categories seeded.');

        // Seed some products
        // Need to fetch some sub-category IDs to link products
        // Let's just grab "Office PC" and "Printers" IDs roughly by name or just first few children
        const childRes = await client.query('SELECT id, parent_id FROM categories WHERE parent_id IS NOT NULL LIMIT 5');
        if (childRes.rows.length > 0) {
            const officePcId = childRes.rows[0].id; // Likely Office PC

            await client.query(`
        INSERT INTO products (category_id, brand, model, sku, title_ru, price, currency, status, technology, format, wifi, color_print)
        VALUES 
        ($1, 'HP', 'ProDesk 400', 'HP-PD-400', 'Компьютер HP ProDesk 400 G9', 4500000, 'UZS', 'in_stock', 'laser', 'A4', true, false),
        ($1, 'Dell', 'OptiPlex 3000', 'DL-OPT-3000', 'Компьютер Dell OptiPlex 3000', 5200000, 'UZS', 'in_stock', 'laser', 'A4', true, false)
      `, [officePcId]);

            console.log('Sample products seeded.');
        }

    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        await client.end();
    }
}

seed();
