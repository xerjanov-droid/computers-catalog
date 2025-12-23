import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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

async function setupSettingsTables() {
    console.log('=== Settings va Logs jadvallarini yaratish ===\n');
    
    try {
        await client.connect();
        console.log('✅ Database\'ga ulandi\n');

        // Read and execute schema
        const schemaPath = path.join(process.cwd(), 'src/lib/schema_settings.sql');
        console.log('📄 Schema faylini o\'qish:', schemaPath);
        
        if (!fs.existsSync(schemaPath)) {
            console.error('❌ Schema fayli topilmadi:', schemaPath);
            process.exit(1);
        }

        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log('📝 Schema bajarilmoqda...\n');
        
        await client.query(schema);
        
        console.log('✅ Settings va System Logs jadvallari muvaffaqiyatli yaratildi!\n');

        // Verify tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('settings', 'system_logs')
        `);

        console.log('📊 Yaratilgan jadvallar:');
        tables.rows.forEach((row: any) => {
            console.log(`   ✓ ${row.table_name}`);
        });

        // Check default settings
        const settingsCount = await client.query('SELECT COUNT(*) FROM settings');
        console.log(`\n📋 Default sozlamalar: ${settingsCount.rows[0].count} ta`);

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

setupSettingsTables();

