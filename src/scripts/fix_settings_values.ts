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

async function fixSettingsValues() {
    console.log('=== Settings qiymatlarini to\'g\'rilash ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Get all settings
        const res = await client.query('SELECT key, value FROM settings');
        
        console.log('📋 Mavjud sozlamalar:\n');
        for (const row of res.rows) {
            console.log(`  ${row.key}: ${JSON.stringify(row.value)} (type: ${typeof row.value})`);
        }

        // Fix values that are not proper JSONB
        const updates = [
            { key: 'price_visible_default', value: true },
            { key: 'sku_auto_generate', value: true },
            { key: 'hide_empty_filters', value: true },
            { key: 'email_notifications', value: true },
            { key: 'admin_notifications', value: true },
            { key: 'maintenance_mode', value: false },
            { key: 'max_images_per_product', value: 10 },
            { key: 'max_image_size_mb', value: 5 },
            { key: 'session_timeout_minutes', value: 60 },
            { key: 'login_attempt_limit', value: 5 },
        ];

        console.log('\n📝 Qiymatlarni yangilash...\n');
        for (const update of updates) {
            await client.query(
                'UPDATE settings SET value = $1::jsonb WHERE key = $2',
                [JSON.stringify(update.value), update.key]
            );
            console.log(`  ✓ ${update.key} = ${JSON.stringify(update.value)}`);
        }

        console.log('\n✅ Barcha sozlamalar to\'g\'rilandi!\n');

    } catch (e: any) {
        console.error('❌ Xatolik:', e.message);
        if (e.detail) {
            console.error('   Detal: ', e.detail);
        }
    } finally {
        await client.end();
    }
}

fixSettingsValues();

