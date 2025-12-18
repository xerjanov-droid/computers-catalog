
import { Client } from 'pg';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker/locale/ru'; // Optional, but let's use simple logic if faker not avail

dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
});

// Helper for random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper for random item
const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Templates per Main Category (Keyword matching)
const TEMPLATES: Record<string, { brands: string[], models: string[], images: string[], specs: Record<string, string[]> }> = {
    'Компьютеры': {
        brands: ['HP', 'Dell', 'Lenovo', 'Acer'],
        models: ['ProDesk', 'OptiPlex', 'IdeaCentre', 'Veriton', 'Vostro'],
        images: ['https://placehold.co/600x600/png?text=PC+Case', 'https://placehold.co/600x600/png?text=Desktop+Setup'],
        specs: {
            'Процессор': ['Intel Core i3-12100', 'Intel Core i5-12400', 'Intel Core i7-12700', 'AMD Ryzen 5 5600G'],
            'ОЗУ': ['8GB DDR4', '16GB DDR4', '32GB DDR4'],
            'Накопитель': ['256GB SSD', '512GB SSD', '1TB HDD + 256GB SSD'],
        }
    },
    'Ноутбуки': {
        brands: ['Asus', 'HP', 'Lenovo', 'MacBook', 'Dell'],
        models: ['VivoBook', 'Pavilion', 'ThinkPad', 'Air M2', 'XPS 13'],
        images: ['https://placehold.co/600x600/png?text=Laptop+Front', 'https://placehold.co/600x600/png?text=Laptop+Side'],
        specs: {
            'Экран': ['13.3" FHD', '15.6" IPS', '14" OLED'],
            'Процессор': ['Intel Core i5', 'M2 Chip', 'AMD Ryzen 7'],
            'Батарея': ['50Wh', '70Wh', '18 часов']
        }
    },
    'Мониторы': {
        brands: ['LG', 'Samsung', 'Dell', 'BenQ'],
        models: ['UltraGear', 'Odyssey', 'UltraSharp', 'GW2480'],
        images: ['https://placehold.co/600x600/png?text=Monitor'],
        specs: {
            'Диагональ': ['24"', '27"', '32"'],
            'Разрешение': ['1920x1080', '2560x1440', '4K UHD'],
            'Матрица': ['IPS', 'VA', 'TN']
        }
    },
    'Компоненты': {
        brands: ['Intel', 'AMD', 'NVIDIA', 'Kingston'],
        models: ['Core i9', 'RTX 4060', 'Fury Beast', '980 Pro'],
        images: ['https://placehold.co/600x600/png?text=Component'],
        specs: {
            'Тип': ['DDR5', 'GDDR6', 'NVMe'],
            'Объем': ['16GB', '8GB', '1TB'],
        }
    },
    'Периферия': {
        brands: ['Logitech', 'Razer', 'HyperX', 'A4Tech'],
        models: ['MX Master 3', 'BlackWidow', 'Cloud II', 'Brio'],
        images: ['https://placehold.co/600x600/png?text=Peripheral'],
        specs: {
            'Подключение': ['USB', 'Bluetooth', 'Wireless'],
            'Цвет': ['Black', 'White', 'RGB']
        }
    },
    'Офисная техника': {
        brands: ['HP', 'Canon', 'Epson', 'Kyocera'],
        models: ['LaserJet Pro', 'i-SENSYS', 'EcoTank', 'Ecosys'],
        images: ['https://placehold.co/600x600/png?text=Printer'],
        specs: {
            'Тип печати': ['Лазерная', 'Струйная'],
            'Формат': ['A4', 'A3'],
            'Скорость': ['20 стр/мин', '40 стр/мин']
        }
    },
    'Сетевое оборудование': {
        brands: ['TP-Link', 'MikroTik', 'Cisco', 'Ubiquiti'],
        models: ['Archer C6', 'hAP ac2', 'Catalyst', 'UniFi AP'],
        images: ['https://placehold.co/600x600/png?text=Router'],
        specs: {
            'Скорость': ['10/100 Mbps', 'Gigabit', 'Wi-Fi 6'],
            'Порты': ['4 LAN', '8 LAN', '24 Ports']
        }
    },
    'Накопители': {
        brands: ['Kingston', 'Samsung', 'WD', 'SanDisk'],
        models: ['DataTraveler', 'T7 Shield', 'Elements', 'Extreme'],
        images: ['https://placehold.co/600x600/png?text=Drive'],
        specs: {
            'Объем': ['64GB', '500GB', '1TB', '4TB'],
            'Интерфейс': ['USB 3.0', 'Type-C', 'SATA']
        }
    },
    'Аксессуары': {
        brands: ['Baseus', 'Ugreen', 'Samsonite'],
        models: ['Cable', 'Charger', 'Backpack'],
        images: ['https://placehold.co/600x600/png?text=Accessory'],
        specs: {
            'Материал': ['Нейлон', 'Пластик', 'Ткань'],
            'Длина': ['1м', '2м']
        }
    },
    'ПО': {
        brands: ['Microsoft', 'Kaspersky', 'Adobe'],
        models: ['Windows 11', 'Office 2021', 'Internet Security'],
        images: ['https://placehold.co/600x600/png?text=Software'],
        specs: {
            'Тип лицензии': ['ESD', 'Box', 'Subscription'],
            'Срок': ['1 год', 'Бессрочно']
        }
    }
};

async function seedProducts() {
    await client.connect();
    console.log('Connected. Fetching all sub-categories...');

    try {
        // Get all sub-categories with their parent name to choose template
        const res = await client.query(`
      SELECT c.id, c.name_ru, p.name_ru as parent_name 
      FROM categories c 
      JOIN categories p ON c.parent_id = p.id
    `);

        const subCategories = res.rows;
        console.log(`Found ${subCategories.length} sub-categories. inserting 3 products for each...`);

        // Prepare batch insert (simpler to loop for this scale)
        for (const sub of subCategories) {
            // Find template
            const parentName = sub.parent_name; // e.g., "Компьютеры"
            // Simple fuzzy match or direct key match
            let template = TEMPLATES[parentName];

            // Fallback if key mismatch (e.g. slight naming diff)
            if (!template) {
                // try find key that partially matches
                const key = Object.keys(TEMPLATES).find(k => parentName.includes(k));
                template = key ? TEMPLATES[key] : TEMPLATES['Аксессуары']; // Default
            }

            for (let i = 0; i < 3; i++) {
                const brand = randomItem(template.brands);
                const model = randomItem(template.models);
                const sku = `${brand.substring(0, 3).toUpperCase()}-${randomInt(1000, 9999)}`;
                const title = `${sub.name_ru} ${brand} ${model} ${randomInt(100, 900)}${i}`;
                const price = randomInt(500000, 15000000);

                // Insert Product
                const pRes = await client.query(`
           INSERT INTO products (
             category_id, brand, model, sku, 
             title_ru, title_uz, title_en, 
             price, currency, status, 
             technology, format, wifi, color_print
           ) VALUES ($1, $2, $3, $4, $5, $5, $5, $6, 'UZS', 'in_stock', 'laser', 'A4', true, false)
           RETURNING id
        `, [sub.id, brand, model, sku, title, price]);

                const pid = pRes.rows[0].id;

                // Insert Image
                const imgUrl = randomItem(template.images);
                await client.query(
                    `INSERT INTO product_images (product_id, image_url, order_index) VALUES ($1, $2, 1)`,
                    [pid, imgUrl]
                );

                // Insert Specs
                for (const [key, values] of Object.entries(template.specs)) {
                    const val = randomItem(values);
                    await client.query(
                        `INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES ($1, $2, $3)`,
                        [pid, key, val]
                    );
                }
            }
        }

        console.log('Successfully populated all categories!');

    } catch (e) {
        console.error('Error seeding products:', e);
    } finally {
        await client.end();
    }
}

seedProducts();
