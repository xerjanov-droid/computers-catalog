
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Dummy value generators based on characteristic keys
const DUMMY_VALUES: Record<string, string[]> = {
    // General
    "cpu": ["Intel Core i5-12400", "AMD Ryzen 5 5600X", "Intel Core i7-13700K", "AMD Ryzen 7 7800X3D", "Intel Core i9-13900K", "M2 Pro"],
    "ram": ["8GB", "16GB", "32GB", "64GB", "16GB DDR5"],
    "storage": ["512GB SSD", "1TB SSD", "2TB NVMe SSD", "256GB SSD + 1TB HDD"],
    "gpu": ["NVIDIA RTX 3050", "NVIDIA RTX 4060", "NVIDIA RTX 4070 Ti", "AMD Radeon RX 7800 XT", "Integrated Graphics"],
    "os": ["Windows 11 Home", "Windows 11 Pro", "FreeDOS", "macOS Sonoma", "No OS"],
    "screen_size": ["13.3\"", "15.6\"", "16\"", "24\"", "27\"", "34\""],
    "resolution": ["1920x1080 (FHD)", "2560x1440 (2K)", "3840x2160 (4K)", "1366x768"],
    "refresh_rate": ["60Hz", "144Hz", "165Hz", "240Hz", "360Hz"],
    "battery": ["50Wh", "70Wh", "99Wh", "4500mAh"],
    "weight": ["1.2 kg", "2.1 kg", "5 kg", "800 g"],
    "ports": ["2x USB 3.0, 1x HDMI", "USB-C, Thunderbolt 4", "USB-A, HDMI, LAN"],
    "connectivity": ["Wi-Fi 6, BT 5.2", "Wi-Fi 6E", "Wi-Fi 5, BT 5.0", "Ethernet"],

    // Components
    "socket": ["LGA 1700", "AM5", "AM4", "LGA 1200"],
    "core_count": ["4", "6", "8", "12", "16", "24"],
    "thread_count": ["8", "12", "16", "24", "32"],
    "frequency": ["2.5 GHz", "3.5 GHz", "4.0 GHz", "5.2 GHz"],
    "form_factor": ["ATX", "Micro-ATX", "Mini-ITX", "E-ATX"],
    "chipset": ["Z790", "B760", "X670", "B650", "H610"],
    "ram_type": ["DDR4", "DDR5", "GDDR6", "GDDR6X"],
    "power_watt": ["500W", "650W", "750W", "850W", "1000W"],
    "certificate": ["80 Plus Bronze", "80 Plus Gold", "80 Plus Platinum"],
    "bus_width": ["128 bit", "192 bit", "256 bit"],
    "vram_size": ["4GB", "8GB", "12GB", "16GB", "24GB"],

    // Peripherals
    "dpi": ["1000", "3200", "16000", "25000"],
    "sensor_type": ["Optical", "Laser"],
    "buttons_count": ["3", "6", "8", "12"],
    "switch_type": ["Red (Linear)", "Blue (Clicky)", "Brown (Tactile)", "Membrane"],
    "keyboard_type": ["Mechanical", "Membrane", "Optical"],
    "backlight": ["RGB", "Single Color", "None"],

    // Software
    "license_type": ["Home", "Pro", "Enterprise", "Subscription"],
    "duration": ["1 Year", "Lifetime", "1 Month"],
    "users_count": ["1 User", "5 Users", "Unlimited"],

    // Default fallback
    "default": ["Yes", "No", "Standard", "Generic", "N/A"]
};

// Helper to get random value
function getRandomValue(key: string, type: string) {
    if (type === 'boolean') return Math.random() > 0.5;
    if (type === 'number') return Math.floor(Math.random() * 100);

    const candidates = DUMMY_VALUES[key] || DUMMY_VALUES['default'];
    return candidates[Math.floor(Math.random() * candidates.length)];
}

async function main() {
    const client = await pool.connect();
    try {
        console.log('Starting product specs backfill...');

        // 1. Find products with empty specs
        // Adjust query if 'specs' is '{}' or NULL
        const res = await client.query(`
            SELECT id, category_id, model 
            FROM products 
            WHERE specs IS NULL OR specs = '{}'::jsonb
        `);

        if (res.rows.length === 0) {
            console.log('No products with empty specs found.');
            return;
        }

        console.log(`Found ${res.rows.length} products to update.`);

        // 2. Process each product
        for (const product of res.rows) {
            if (!product.category_id) {
                console.warn(`Product ${product.id} has no category. Skipping.`);
                continue;
            }

            // Fetch characteristics for this category
            const charRes = await client.query(`
                SELECT c.key, c.type
                FROM category_characteristics cc
                JOIN characteristics c ON cc.characteristic_id = c.id
                WHERE cc.category_id = $1
            `, [product.category_id]);

            if (charRes.rows.length === 0) {
                // Might happen if category has no chars mapped yet
                console.warn(`Category ${product.category_id} has no characteristics linked. Skipping product ${product.id}.`);
                continue;
            }

            // Generate Schema
            const specs: Record<string, any> = {};

            for (const char of charRes.rows) {
                specs[char.key] = getRandomValue(char.key, char.type);
            }

            // Update Product
            await client.query(`
                UPDATE products 
                SET specs = $1 
                WHERE id = $2
            `, [JSON.stringify(specs), product.id]);

            console.log(`Updated Product ${product.id} (${product.model}) with ${Object.keys(specs).length} specs.`);
        }

        console.log('Backfill completed successfully.');

    } catch (e) {
        console.error('Backfill failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
