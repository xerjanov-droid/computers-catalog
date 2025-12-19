
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
    console.log('Connected to DB. Applying schema changes and seeding...');

    try {
        // Schema Migration (Quick & Dirty for Dev)
        // Ensure slug exists on categories
        await client.query(`
            ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
        `);
        // Ensure specs exists on products
        await client.query(`
            ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
        `);
        // Drop legacy table
        await client.query(`DROP TABLE IF EXISTS product_specs CASCADE;`);

        // Clear data
        await client.query('TRUNCATE products, categories, product_images, favorites RESTART IDENTITY CASCADE');

        const taxonomy = [
            {
                name_ru: 'Компьютеры', name_uz: 'Kompyuterlar', name_en: 'Computers', slug: 'computers', icon: '/images/category_computers.png',
                subs: [
                    { name_ru: 'Офисные ПК', name_uz: 'Stol kompyuterlari (Office)', name_en: 'Office PC', slug: 'office-pc' },
                    { name_ru: 'Игровые ПК', name_uz: 'Stol kompyuterlari (Gaming)', name_en: 'Gaming PC', slug: 'gaming-pc' },
                    { name_ru: 'Рабочие станции', name_uz: 'Workstation', name_en: 'Workstations', slug: 'workstations' },
                    { name_ru: 'Моноблоки', name_uz: 'Monobloklar', name_en: 'All-in-One', slug: 'aio' },
                    { name_ru: 'Мини ПК', name_uz: 'Mini PC', name_en: 'Mini PC', slug: 'mini-pc' },
                ]
            },
            {
                name_ru: 'Ноутбуки', name_uz: 'Noutbuklar', name_en: 'Laptops', slug: 'laptops', icon: '/images/category_laptops.png',
                subs: [
                    { name_ru: 'Офисные ноутбуки', name_uz: 'Office noutbuklar', name_en: 'Office Laptops', slug: 'office-laptops' },
                    { name_ru: 'Игровые ноутбуки', name_uz: 'Gaming noutbuklar', name_en: 'Gaming Laptops', slug: 'gaming-laptops' },
                    { name_ru: 'Бизнес класс', name_uz: 'Biznes klass', name_en: 'Business Class', slug: 'business-laptops' },
                    { name_ru: 'Ультрабуки', name_uz: 'Ultrabook', name_en: 'Ultrabooks', slug: 'ultrabooks' },
                    { name_ru: 'Трансформеры 2-в-1', name_uz: 'Transformerlari (2-in-1)', name_en: '2-in-1', slug: '2in1-laptops' },
                ]
            },
            {
                name_ru: 'Мониторы', name_uz: 'Monitorlar', name_en: 'Monitors', slug: 'monitors', icon: '/images/category_monitors.png',
                subs: [
                    { name_ru: 'Офисные мониторы', name_uz: 'Office monitorlar', name_en: 'Office Monitors', slug: 'office-monitors' },
                    { name_ru: 'Игровые мониторы', name_uz: 'Gaming monitorlar', name_en: 'Gaming Monitors', slug: 'gaming-monitors' },
                    { name_ru: 'Профессиональные', name_uz: 'Professional (Design / Video)', name_en: 'Professional', slug: 'pro-monitors' },
                    { name_ru: 'Ultrawide', name_uz: 'Ultrawide', name_en: 'Ultrawide', slug: 'ultrawide-monitors' },
                    { name_ru: 'Портативные', name_uz: 'Portable monitorlar', name_en: 'Portable', slug: 'portable-monitors' },
                ]
            },
            {
                name_ru: 'Компоненты', name_uz: 'Komponentlar', name_en: 'Components', slug: 'components', icon: '/images/category_components.png',
                subs: [
                    { name_ru: 'Процессоры (CPU)', name_uz: 'Protsessorlar (CPU)', name_en: 'CPU', slug: 'cpu' },
                    { name_ru: 'Видеокарты (GPU)', name_uz: 'Video kartalar (GPU)', name_en: 'GPU', slug: 'gpu' },
                    { name_ru: 'Материнские платы', name_uz: 'Ona platalar (Motherboard)', name_en: 'Motherboards', slug: 'motherboards' },
                    { name_ru: 'Оперативная память (RAM)', name_uz: 'Operativ xotira (RAM)', name_en: 'RAM', slug: 'ram' },
                    { name_ru: 'SSD / HDD', name_uz: 'SSD / HDD', name_en: 'Storage', slug: 'drives' },
                    { name_ru: 'Блоки питания', name_uz: 'Quvvat bloklari (PSU)', name_en: 'PSU', slug: 'psu' },
                    { name_ru: 'Охлаждение', name_uz: 'Sovutish tizimlari', name_en: 'Cooling', slug: 'cooling' },
                    { name_ru: 'Корпуса', name_uz: 'Korpuslar', name_en: 'Cases', slug: 'cases' },
                ]
            },
            {
                name_ru: 'Периферия', name_uz: 'Periferiya', name_en: 'Peripherals', slug: 'peripherals', icon: '/images/category_peripherals.png',
                subs: [
                    { name_ru: 'Клавиатуры', name_uz: 'Klaviaturalar', name_en: 'Keyboards', slug: 'keyboards' },
                    { name_ru: 'Мыши', name_uz: 'Sichqonchalar', name_en: 'Mice', slug: 'mice' },
                    { name_ru: 'Гарнитуры', name_uz: 'Quloqchin / Garnitura', name_en: 'Headsets', slug: 'headsets' },
                    { name_ru: 'Веб-камеры', name_uz: 'Veb-kameralar', name_en: 'Webcams', slug: 'webcams' },
                    { name_ru: 'Микрофоны', name_uz: 'Mikrofonlar', name_en: 'Microphones', slug: 'microphones' },
                    { name_ru: 'Геймпады', name_uz: 'Joystick / Gamepad', name_en: 'Gamepads', slug: 'gamepads' },
                ]
            },
            {
                name_ru: 'Офисная техника', name_uz: 'Ofis texnikasi', name_en: 'Office Equipment', slug: 'office-equipment', icon: '/images/category_printers.png',
                subs: [
                    { name_ru: 'Принтеры', name_uz: 'Printerlar', name_en: 'Printers', slug: 'printers' },
                    { name_ru: 'МФУ', name_uz: 'MFP (МФУ)', name_en: 'MFP', slug: 'mfp' },
                    { name_ru: 'Сканеры', name_uz: 'Skanerlar', name_en: 'Scanners', slug: 'scanners' },
                    { name_ru: 'ИБП (UPS)', name_uz: 'UPS (ИБП)', name_en: 'UPS', slug: 'ups' },
                    { name_ru: 'Ламинаторы', name_uz: 'Laminatorlar', name_en: 'Laminators', slug: 'laminators' },
                    { name_ru: 'Шредеры', name_uz: 'Shredderlar', name_en: 'Shredders', slug: 'shredders' },
                ]
            },
            {
                name_ru: 'Сетевое оборудование', name_uz: 'Tarmoq uskunalari', name_en: 'Networking', slug: 'networking', icon: '/images/category_networking.png',
                subs: [
                    { name_ru: 'Роутеры', name_uz: 'Routerlar', name_en: 'Routers', slug: 'routers' },
                    { name_ru: 'Коммутаторы', name_uz: 'Switchlar', name_en: 'Switches', slug: 'switches' },
                    { name_ru: 'Точки доступа', name_uz: 'Access Point', name_en: 'Access Points', slug: 'access-points' },
                    { name_ru: 'Модемы', name_uz: 'Modemlar', name_en: 'Modems', slug: 'modems' },
                    { name_ru: 'Wi-Fi адаптеры', name_uz: 'Wi-Fi adapterlar', name_en: 'Wi-Fi Adapters', slug: 'wifi-adapters' },
                ]
            },
            {
                name_ru: 'Накопители', name_uz: 'Saqlash qurilmalari', name_en: 'Storage Devices', slug: 'storage-devices', icon: '/images/category_peripherals.png',
                subs: [
                    { name_ru: 'Внешние HDD', name_uz: 'Tashqi HDD', name_en: 'External HDD', slug: 'external-hdd' },
                    { name_ru: 'Внешние SSD', name_uz: 'Tashqi SSD', name_en: 'External SSD', slug: 'external-ssd' },
                    { name_ru: 'USB Flash', name_uz: 'USB Flash', name_en: 'USB Flash', slug: 'usb-flash' },
                    { name_ru: 'NAS', name_uz: 'NAS', name_en: 'NAS', slug: 'nas' },
                    { name_ru: 'Card Reader', name_uz: 'Card Reader', name_en: 'Card Readers', slug: 'card-readers' },
                ]
            },
            {
                name_ru: 'Аксессуары', name_uz: 'Aksessuarlar', name_en: 'Accessories', slug: 'accessories', icon: '/images/category_acsessuars.png',
                subs: [
                    { name_ru: 'Сумки и рюкзаки', name_uz: 'Sumkalar va ryukzaklar', name_en: 'Bags', slug: 'bags' },
                    { name_ru: 'Подставки', name_uz: 'Sovutish tagliklari', name_en: 'Cooling Pads', slug: 'cooling-pads' },
                    { name_ru: 'Кабели', name_uz: 'Kabel va adapterlar', name_en: 'Cables', slug: 'cables' },
                    { name_ru: 'Зарядные устройства', name_uz: 'Zaryadlovchilar', name_en: 'Chargers', slug: 'chargers' },
                    { name_ru: 'Батареи для ИБП', name_uz: 'UPS batareyalari', name_en: 'UPS Batteries', slug: 'ups-batteries' },
                ]
            },
            {
                name_ru: 'ПО', name_uz: 'Dasturiy ta’minot', name_en: 'Software', slug: 'software', icon: '/images/category_po.png',
                subs: [
                    { name_ru: 'Windows', name_uz: 'Operatsion tizimlar (Windows)', name_en: 'OS', slug: 'windows' },
                    { name_ru: 'Office', name_uz: 'Office paketlar', name_en: 'Office Suites', slug: 'office-software' },
                    { name_ru: 'Антивирусы', name_uz: 'Antiviruslar', name_en: 'Antivirus', slug: 'antivirus' },
                    { name_ru: 'Бухгалтерия', name_uz: 'Buxgalteriya dasturlari', name_en: 'Accounting', slug: 'accounting' },
                    { name_ru: 'Лицензии', name_uz: 'Litsenziya kalitlari', name_en: 'Keys', slug: 'licenses' },
                ]
            },
        ];

        let orderIndex = 1;
        for (const mainCat of taxonomy) {
            // Insert Main Category
            const mainRes = await client.query(
                `INSERT INTO categories (name_ru, name_uz, name_en, slug, icon, order_index, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
                [mainCat.name_ru, mainCat.name_uz, mainCat.name_en, mainCat.slug, mainCat.icon, orderIndex++]
            );
            const parentId = mainRes.rows[0].id;

            // Insert Sub Categories
            let subOrder = 1;
            for (const subCat of mainCat.subs) {
                await client.query(
                    `INSERT INTO categories (parent_id, name_ru, name_uz, name_en, slug, order_index, is_active) 
                     VALUES ($1, $2, $3, $4, $5, $6, true)`,
                    [parentId, subCat.name_ru, subCat.name_uz, subCat.name_en, subCat.slug, subOrder++]
                );
            }
        }

        console.log('Categories seeded with slugs.');

        // Seed products for all subcategories
        const childRes = await client.query('SELECT id, slug, name_ru FROM categories WHERE parent_id IS NOT NULL');

        for (const cat of childRes.rows) {
            const catId = cat.id;
            const slug = cat.slug;
            const baseName = cat.name_ru;

            let specs1 = {};
            let specs2 = {};
            let specs3 = {};

            // Helper to generate specs based on slug
            switch (slug) {
                // COMPUTERS
                case 'office-pc':
                    specs1 = { cpu: 'Intel Core i3-12100', ram: '8GB DDR4', storage: '256GB SSD', gpu: 'UHD 730', os: 'Windows 11 Home', case_type: 'Mini Tower' };
                    specs2 = { cpu: 'Intel Core i5-12400', ram: '16GB DDR4', storage: '512GB SSD', gpu: 'UHD 730', os: 'Windows 11 Pro', case_type: 'Mid Tower' };
                    specs3 = { cpu: 'AMD Ryzen 5 5600G', ram: '16GB DDR4', storage: '512GB NVMe', gpu: 'Vega 7', os: 'No OS', case_type: 'Mini Tower' };
                    break;
                case 'gaming-pc':
                    specs1 = { cpu: 'Intel Core i5-13600K', ram: '32GB DDR5', storage: '1TB NVMe', gpu: 'RTX 4070 12GB', psu: '750W Gold', cooling: 'Air Cooler', os: 'Windows 11' };
                    specs2 = { cpu: 'AMD Ryzen 7 7800X3D', ram: '32GB DDR5', storage: '2TB NVMe', gpu: 'RTX 4080 16GB', psu: '850W Gold', cooling: 'Liquid 240mm', os: 'Windows 11' };
                    specs3 = { cpu: 'Intel Core i9-14900K', ram: '64GB DDR5', storage: '4TB NVMe', gpu: 'RTX 4090 24GB', psu: '1000W Platinum', cooling: 'Liquid 360mm', os: 'Windows 11' };
                    break;
                case 'workstations':
                    specs1 = { cpu: 'Threadripper 5955WX', ram: '128GB ECC', storage: '2TB NVMe', gpu: 'RTX A4000', raid: true, os: 'Windows 10 Pro' };
                    break;
                case 'aio':
                    specs1 = { screen: '23.8" IPS FHD', cpu: 'Core i5-1240P', ram: '16GB', storage: '512GB SSD' };
                    break;

                // LAPTOPS
                case 'office-laptops':
                    specs1 = { screen: '15.6" FHD', cpu: 'Core i5-1135G7', ram: '8GB', storage: '512GB SSD', battery: '42Wh', weight: '1.7 kg', os: 'DOS' };
                    break;
                case 'gaming-laptops':
                    specs1 = { screen: '16" 165Hz QHD', cpu: 'Core i9-13900H', ram: '32GB', storage: '1TB SSD', gpu: 'RTX 4070', battery: '90Wh', cooling: 'Dual Fan', weight: '2.5 kg' };
                    break;
                case 'business-laptops':
                    specs1 = { screen: '14" FHD+ IPS', cpu: 'Core i7-1355U', ram: '16GB LPDDR5', storage: '1TB SSD', battery: '15 hours', weight: '1.2 kg', security: 'Fingerprint', os: 'Win 11 Pro' };
                    break;

                // PRINTERS
                case 'printers':
                    specs1 = { technology: 'Laser', format: 'A4', speed: '20 ppm', color: 'Monochrome', duplex: false, wifi: false, ethernet: false, cartridge: 'TN-1050', ink_type: '-' };
                    specs2 = { technology: 'Inkjet', format: 'A3', speed: '15 ppm', color: 'Color', duplex: true, wifi: true, ethernet: true, cartridge: 'EcoTank', ink_type: 'Liquid' };
                    break;
                case 'mfp':
                    specs1 = { functions: 'Print, Scan, Copy', technology: 'Laser', format: 'A4', speed: '40 ppm', duplex: true, wifi: true, scanner_type: 'Flatbed' };
                    break;
                case 'scanners':
                    specs1 = { scanner_type: 'Document Scanner', resolution: '600 dpi', speed: '30 ppm', adf: true, interface: 'USB 3.0' };
                    break;

                // MONITORS
                case 'office-monitors':
                    specs1 = { screen_size: '24"', resolution: '1920x1080', panel_type: 'IPS', refresh_rate: '60Hz', response_time: '5ms', ports: 'HDMI' };
                    break;
                case 'gaming-monitors':
                    specs1 = { screen_size: '27"', resolution: '2560x1440', refresh_rate: '144Hz', response_time: '1ms', sync: 'G-Sync', ports: 'DP, HDMI' };
                    break;

                // COMPONENTS
                case 'cpu':
                    specs1 = { model: 'i5-12400F', cores: '6/12', frequency: '2.5 GHz', socket: 'LGA1700', tdp: '65W' };
                    break;
                case 'gpu':
                    specs1 = { model: 'RTX 4060', mem_size: '8GB', mem_type: 'GDDR6', outputs: '3xDP, 1xHDMI', power: '115W' };
                    break;
                case 'ram':
                    specs1 = { capacity: '16GB', type: 'DDR4', frequency: '3200MHz', modules: '2x8GB' };
                    break;

                // NETWORKING
                case 'routers':
                    specs1 = { wifi_std: 'Wi-Fi 6', speed: 'AX3000', frequency: '2.4/5 GHz', ports: '4x GbE' };
                    break;
                case 'switches':
                    specs1 = { ports: '8', speed: 'Gigabit', type: 'Unmanaged' };
                    break;

                case 'mini-pc':
                    specs1 = { cpu: 'Intel NUC i7', ram: '16GB', storage: '512GB SSD', gpu: 'Iris Xe', os: 'Windows 11' };
                    break;

                // LAPTOPS EXTRA
                case 'ultrabooks':
                    specs1 = { screen: '13.3" 4K OLED', cpu: 'Core i7-1260P', ram: '16GB', storage: '1TB SSD', weight: '1.0 kg', battery: '12h' };
                    break;
                case '2in1-laptops':
                    specs1 = { screen: '14" Touch', cpu: 'Ryzen 7 6800U', ram: '16GB', storage: '512GB', weight: '1.4 kg', os: 'Win 11 Home' };
                    break;

                // MONITORS EXTRA
                case 'pro-monitors':
                    specs1 = { screen_size: '32"', resolution: '4K', panel_type: 'IPS Black', color_gamut: '99% AdobeRGB', calibration: true };
                    break;
                case 'ultrawide-monitors':
                    specs1 = { screen_size: '34"', resolution: '3440x1440', refresh_rate: '144Hz', panel_type: 'VA', sync: 'FreeSync' };
                    break;
                case 'portable-monitors':
                    specs1 = { screen_size: '15.6"', resolution: 'FHD', panel_type: 'IPS', weight: '700g', connection: 'USB-C' };
                    break;

                // COMPONENTS EXTRA
                case 'motherboards':
                    specs1 = { socket: 'LGA1700', chipset: 'Z790', form_factor: 'ATX', ram_slots: '4x DDR5' };
                    break;
                case 'psu':
                    specs1 = { power: '850W', certification: '80+ Gold', modular: true };
                    break;
                case 'cooling':
                    specs1 = { type: 'Liquid AIO', fan_size: '240mm', tdp: '250W' };
                    break;
                case 'cases':
                    specs1 = { form_factor: 'ATX', type: 'Mid Tower', window: true };
                    break;
                case 'drives':
                    specs1 = { type: 'SSD NVMe', capacity: '1TB', interface: 'PCIe 4.0', speed: '7000 MB/s' };
                    break;

                // PERIPHERALS
                case 'keyboards':
                    specs1 = { type: 'Mechanical', layout: '104 keys', backlight: 'RGB', connection: 'USB' };
                    break;
                case 'mice':
                    specs1 = { dpi: '16000', sensor: 'Optical', connection: 'Wireless', buttons: '6' };
                    break;
                case 'headsets':
                    specs1 = { type: 'Over-Ear', microphone: true, connection: 'USB / 3.5mm', anc: true };
                    break;
                case 'webcams':
                    specs1 = { resolution: '1080p', fps: '60fps', microphone: true };
                    break;
                case 'microphones':
                    specs1 = { type: 'Condenser', connection: 'USB', pattern: 'Cardioid' };
                    break;
                case 'gamepads':
                    specs1 = { platform: 'PC / Xbox', connection: 'Wireless', vibration: true };
                    break;

                // OFFICE EQUIPMENT EXTRA
                case 'ups':
                    specs1 = { power_va: '1000VA', power_watts: '600W', type: 'Line-Interactive', sockets: '4x Schuko' };
                    break;
                case 'laminators':
                    specs1 = { format: 'A4', speed: '30cm/min' }; // Generic fallback
                    break;
                case 'shredders':
                    specs1 = { type: 'Cross-cut', capacity: '10 sheets' };
                    break;

                // NETWORKING EXTRA
                case 'access-points':
                    specs1 = { wifi_std: 'Wi-Fi 6', speed: '1800Mbps', poe: true };
                    break;
                case 'modems':
                    specs1 = { type: 'VDSL2/ADSL2+', speed: '300Mbps' };
                    break;
                case 'wifi-adapters':
                    specs1 = { interface: 'USB', wifi_std: 'AC1200' };
                    break;

                // STORAGE
                case 'external-hdd':
                    specs1 = { capacity: '2TB', form_factor: '2.5"', interface: 'USB 3.0' };
                    break;
                case 'external-ssd':
                    specs1 = { capacity: '1TB', speed: '1050 MB/s', interface: 'USB-C' };
                    break;
                case 'usb-flash':
                    specs1 = { capacity: '128GB', interface: 'USB 3.1', material: 'Metal' };
                    break;
                case 'nas':
                    specs1 = { bays: '2-Bay', cpu: 'Realtek', ram: '2GB' };
                    break;

                // ACCESSORIES
                case 'bags':
                    specs1 = { type: 'Backpack', max_laptop_size: '15.6"', material: 'Polyester' };
                    break;

                // SOFTWARE
                case 'windows':
                    specs1 = { product_type: 'OS', version: 'Windows 11 Pro', license_type: 'Retail', activation: 'Online' };
                    break;
                case 'antivirus':
                    specs1 = { product_type: 'Antivirus', devices: '3 Devices', duration: '1 Year' };
                    break;
                case 'office-software':
                    specs1 = { product_type: 'Office Suite', version: '2021', license_type: 'Perpetual' };
                    break;

                default:
                    // Generic fallback for others
                    specs1 = { model: 'Generic Model' };
            }

            // Create products
            await client.query(`
                INSERT INTO products 
                (category_id, brand, model, sku, title_ru, title_uz, title_en, price, currency, status, technology, format, wifi, color_print, specs)
                VALUES 
                ($1, 'BrandX', 'Model A1', $2, $3, $3, $3, 2500000, 'UZS', 'in_stock', 'laser', 'A4', true, false, $8),
                ($1, 'BrandY', 'Model B2', $4, $5, $5, $5, 4500000, 'UZS', 'showroom', 'inkjet', 'A3', true, true, $9),
                ($1, 'BrandZ', 'Model C3', $6, $7, $7, $7, 10000000, 'UZS', 'pre_order', 'laser', 'A4', false, false, $10)
            `, [
                catId,
                `SKU-${catId}-1`, `${baseName}`,
                `SKU-${catId}-2`, `${baseName} Pro`,
                `SKU-${catId}-3`, `${baseName} Elite`,
                JSON.stringify(specs1),
                JSON.stringify(Object.keys(specs2).length ? specs2 : specs1),
                JSON.stringify(Object.keys(specs3).length ? specs3 : specs1)
            ]);
        }

        console.log(`Seeded products with rich JSONB specs for all subcategories.`);

    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        await client.end();
    }
}

seed();
