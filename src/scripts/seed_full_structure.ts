
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

// DATA DEFINITION (V3.0 STRICT)
interface SubCategoryDef {
    name: string;
    chars: string[];
}
interface CategoryDef {
    name: string;
    subs: SubCategoryDef[];
}

const DATA: CategoryDef[] = [
    {
        name: "Computers",
        subs: [
            { name: "Office PC", chars: ["CPU", "RAM", "Storage (SSD/HDD)", "Integrated Graphics", "Operating System", "Case Type"] },
            { name: "Gaming PC", chars: ["CPU", "GPU", "RAM", "Storage (SSD/HDD)", "Power Supply", "Cooling System"] },
            { name: "Workstations", chars: ["CPU", "GPU", "RAM", "Storage", "Operating System", "Certification (ISV)"] },
            { name: "All-in-One", chars: ["Screen Size", "CPU", "RAM", "Storage", "Touchscreen", "Operating System"] },
            { name: "Mini PC", chars: ["CPU", "RAM", "Storage", "Graphics Type", "Mount Support (VESA)", "Operating System"] },
        ]
    },
    {
        name: "Laptops",
        subs: [
            { name: "Office Laptops", chars: ["Screen Size", "CPU", "RAM", "Storage", "Battery Capacity", "Weight"] },
            { name: "Gaming Laptops", chars: ["Screen Refresh Rate", "CPU", "GPU", "RAM", "Storage", "Cooling Type"] },
            { name: "Business Class", chars: ["CPU", "RAM", "Storage", "Security Features", "Battery Life", "Operating System"] },
            { name: "Ultrabooks", chars: ["Screen Size", "CPU", "RAM", "Storage", "Weight", "Battery Life"] },
            { name: "2-in-1", chars: ["Screen Type", "CPU", "RAM", "Storage", "Stylus Support", "Operating System"] },
        ]
    },
    {
        name: "Monitors",
        subs: [
            { name: "Office Monitors", chars: ["Screen Size", "Resolution", "Panel Type", "Refresh Rate", "Ports", "Adjustable Stand"] },
            { name: "Gaming Monitors", chars: ["Screen Size", "Resolution", "Refresh Rate", "Response Time", "Sync Technology", "Panel Type"] },
            { name: "Professional", chars: ["Screen Size", "Resolution", "Color Gamut", "Panel Type", "Factory Calibration", "Ports"] },
            { name: "Ultrawide", chars: ["Screen Size", "Aspect Ratio", "Resolution", "Panel Type", "Refresh Rate", "Ports"] },
            { name: "Portable", chars: ["Screen Size", "Resolution", "Weight", "Power Source", "Connectivity", "Stand Type"] },
        ]
    },
    {
        name: "Components",
        subs: [
            { name: "CPU", chars: ["Socket", "Core Count", "Thread Count", "Base Frequency", "Turbo Frequency", "TDP"] },
            { name: "GPU", chars: ["Chipset", "VRAM Size", "Memory Type", "Outputs", "Power Consumption", "Cooling Type"] },
            { name: "Motherboards", chars: ["Socket", "Chipset", "Form Factor", "RAM Slots", "Storage Interfaces", "Expansion Slots"] },
            { name: "RAM", chars: ["Capacity", "Type", "Frequency", "Voltage", "Form Factor", "Kit Type"] },
            { name: "Storage", chars: ["Capacity", "Type (SSD/HDD)", "Interface", "Read Speed", "Write Speed", "Form Factor"] },
            { name: "PSU", chars: ["Power (Watt)", "Efficiency Rating", "Modular Type", "Protection Features", "Cooling Fan Size", "Form Factor"] },
            { name: "Cooling", chars: ["Type (Air/Liquid)", "Socket Support", "Fan Size", "Noise Level", "TDP Support", "RGB Support"] },
            { name: "Cases", chars: ["Form Factor", "Material", "Cooling Support", "Drive Bays", "Front Ports", "RGB Support"] },
        ]
    },
    {
        name: "Peripherals",
        subs: [
            { name: "Keyboards", chars: ["Type", "Connection", "Switch Type", "Backlight", "Layout", "Wrist Rest"] },
            { name: "Mice", chars: ["Sensor Type", "DPI", "Buttons Count", "Connection", "Weight", "RGB"] },
            { name: "Headsets", chars: ["Type", "Connection", "Microphone", "Frequency Range", "Noise Cancellation", "Compatibility"] },
            { name: "Webcams", chars: ["Resolution", "Frame Rate", "Autofocus", "Microphone", "Mount Type", "Connection"] },
            { name: "Microphones", chars: ["Type", "Polar Pattern", "Frequency Range", "Connection", "Stand Included", "Use Case"] },
            { name: "Gamepads", chars: ["Platform Support", "Connection", "Vibration", "Battery Type", "Layout", "Compatibility"] },
        ]
    },
    {
        name: "Office Equipment",
        subs: [
            { name: "Printers", chars: ["Print Type", "Print Speed", "Resolution", "Connectivity", "Duplex Support", "Paper Size"] },
            { name: "MFP", chars: ["Functions", "Print Speed", "Scan Resolution", "Connectivity", "Duplex", "ADF Support"] },
            { name: "Scanners", chars: ["Scan Type", "Resolution", "Scan Speed", "Interface", "ADF", "Max Paper Size"] },
            { name: "UPS", chars: ["Capacity (VA)", "Output Power", "Battery Type", "Backup Time", "Outlets", "Protection"] },
            { name: "Laminators", chars: ["Max Paper Size", "Warm-up Time", "Lamination Thickness", "Speed", "Temperature Control", "Use Type"] },
            { name: "Shredders", chars: ["Cut Type", "Sheet Capacity", "Security Level", "Bin Capacity", "Continuous Run Time", "Noise Level"] },
        ]
    },
    {
        name: "Networking",
        subs: [
            { name: "Routers", chars: ["Wi-Fi Standard", "Speed", "Bands", "Ports", "Antennas", "Security"] },
            { name: "Switches", chars: ["Ports Count", "Speed", "Managed Type", "Rack Mountable", "PoE Support", "Power Consumption"] },
            { name: "Access Points", chars: ["Wi-Fi Standard", "Coverage Area", "Mount Type", "Power Method", "Max Clients", "Security"] },
            { name: "Modems", chars: ["Connection Type", "Speed", "ISP Compatibility", "Ports", "Wi-Fi Support", "Form Factor"] },
            { name: "Wi-Fi Adapters", chars: ["Standard", "Speed", "Interface", "Antenna", "OS Support", "Form Factor"] },
        ]
    },
    {
        name: "Storage Devices",
        subs: [
            { name: "External HDD", chars: ["Capacity", "Interface", "Speed", "Form Factor", "Power Source", "Compatibility"] },
            { name: "External SSD", chars: ["Capacity", "Interface", "Read Speed", "Write Speed", "Shock Resistance", "Form Factor"] },
            { name: "USB Flash", chars: ["Capacity", "Interface", "Read Speed", "Write Speed", "Material", "Security"] },
            { name: "NAS", chars: ["Bays Count", "CPU", "RAM", "RAID Support", "Network Speed", "OS"] },
            { name: "Card Readers", chars: ["Supported Cards", "Interface", "Speed", "Slots Count", "OS Support", "Form Factor"] },
        ]
    },
    {
        name: "Accessories",
        subs: [
            { name: "Bags", chars: ["Type", "Size Compatibility", "Material", "Compartments", "Waterproof", "Color"] },
            { name: "Cooling Pads", chars: ["Fan Count", "Size Support", "Noise Level", "USB Ports", "Adjustable Height", "RGB"] },
            { name: "Cables", chars: ["Type", "Length", "Connector", "Data Speed", "Shielding", "Color"] },
            { name: "Chargers", chars: ["Power Output", "Connector Type", "Fast Charge", "Compatibility", "Cable Included", "Protection"] },
            { name: "UPS Batteries", chars: ["Capacity", "Voltage", "Battery Type", "Compatibility", "Life Cycle", "Dimensions"] },
        ]
    },
    {
        name: "Software",
        subs: [
            { name: "OS", chars: ["License Type", "Architecture", "Language Support", "Activation Type", "Platform", "Validity"] },
            { name: "Office Suites", chars: ["License Type", "Included Apps", "Platform", "Language", "Subscription", "Activation"] },
            { name: "Antivirus", chars: ["License Duration", "Devices Count", "Protection Type", "Platform", "Updates", "Firewall"] },
            { name: "Accounting", chars: ["License Type", "Users Count", "Platform", "Language", "Updates", "Support"] },
            { name: "Keys", chars: ["Product Type", "License Type", "Activation Method", "Platform", "Validity", "Delivery Method"] },
        ]
    }
];

// Helper: Slugify (EN name -> en slug)
function slugify(text: string): string {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Helper: Characteristic Key (EN Label -> key)
function toCharKey(label: string): string {
    return slugify(label).replace(/-/g, '_');
}

async function main() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('--- START SEEDING V3.0 (Strict Hierarchy) ---');

        for (const catDef of DATA) {
            const catSlug = slugify(catDef.name);

            // 1. Ensure Parent Category
            // Insert or Update. Using name_en as source of truth for name_ru/name_uz fallback if missing
            // But usually we just update if exists.

            let parentId: number;
            const parentRes = await client.query('SELECT id FROM categories WHERE slug = $1', [catSlug]);

            if (parentRes.rows.length > 0) {
                parentId = parentRes.rows[0].id;
                // Update names just in case
                await client.query(`
                    UPDATE categories SET name_en = $1, name_ru = $1, name_uz = $1 
                    WHERE id = $2
                `, [catDef.name, parentId]);
                console.log(`Updated Parent: ${catDef.name}`);
            } else {
                const insertRes = await client.query(`
                    INSERT INTO categories (name_ru, name_uz, name_en, slug, is_active)
                    VALUES ($1, $1, $1, $2, true)
                    RETURNING id
                `, [catDef.name, catSlug]);
                parentId = insertRes.rows[0].id;
                console.log(`Created Parent: ${catDef.name}`);
            }

            // 2. Process Subcategories
            for (const subDef of catDef.subs) {
                const subSlug = slugify(subDef.name);
                let subId: number;

                const subRes = await client.query('SELECT id FROM categories WHERE slug = $1', [subSlug]);

                if (subRes.rows.length > 0) {
                    subId = subRes.rows[0].id;
                    await client.query(`
                        UPDATE categories SET parent_id = $1, name_en = $2, name_ru = $2, name_uz = $2
                        WHERE id = $3
                    `, [parentId, subDef.name, subId]);
                    console.log(`  Updated Sub: ${subDef.name}`);
                } else {
                    const insertRes = await client.query(`
                        INSERT INTO categories (parent_id, name_ru, name_uz, name_en, slug, is_active)
                        VALUES ($1, $2, $2, $2, $3, true)
                        RETURNING id
                    `, [parentId, subDef.name, subSlug]);
                    subId = insertRes.rows[0].id;
                    console.log(`  Created Sub: ${subDef.name}`);
                }

                // 3. Sync Characteristics

                // First, ensure all chars exist in global dictionary
                const charIds: number[] = [];
                for (const charLabel of subDef.chars) {
                    const charKey = toCharKey(charLabel);

                    // Determine type (heuristic)
                    let type = 'text';
                    if (['count', 'size', 'rating', 'watt', 'dpi', 'speed', 'rate'].some(k => charKey.includes(k))) type = 'text'; // Simplified: keep text to be safe matches user list which looks like text descriptions often
                    // Actually user list has things like "True/False" implied? 
                    // e.g. "Duplex Support". Use text for flexibility unless obvious.

                    // Insert characteristic
                    await client.query(`
                        INSERT INTO characteristics (key, name_ru, name_uz, name_en, type, is_active)
                        VALUES ($1, $2, $2, $2, $3, true)
                        ON CONFLICT (key) DO UPDATE SET
                           name_en = EXCLUDED.name_en, name_ru = EXCLUDED.name_ru, name_uz = EXCLUDED.name_uz
                        RETURNING id
                    `, [charKey, charLabel, type]);

                    // Fetch ID (using separate select to be safe with ON CONFLICT DO UPDATE RETURNING quirks sometimes)
                    const getChar = await client.query('SELECT id FROM characteristics WHERE key = $1', [charKey]);
                    charIds.push(getChar.rows[0].id);
                }

                // Now Link (Strict Sync: Delete all, Insert New)
                await client.query('DELETE FROM category_characteristics WHERE category_id = $1', [subId]);

                let order = 0;
                for (const cId of charIds) {
                    await client.query(`
                        INSERT INTO category_characteristics (category_id, characteristic_id, is_required, show_in_key_specs, order_index)
                        VALUES ($1, $2, true, true, $3)
                    `, [subId, cId, order++]);
                }
                // console.log(`    Linked ${charIds.length} chars to ${subDef.name}`);
            }
        }

        await client.query('COMMIT');
        console.log('--- SEEDING V3.0 COMPLETED SUCCESSFULLY ---');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
