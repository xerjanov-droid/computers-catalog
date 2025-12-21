
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function query(text: string, params?: any[]) {
    return pool.query(text, params);
}

async function updateSchema() {
    console.log('🔄 Updating Schema for Characteristics...');
    try {
        // Characteristics Dictionary
        await query(`
            CREATE TABLE IF NOT EXISTS characteristics (
              id SERIAL PRIMARY KEY,
              key VARCHAR(100) UNIQUE NOT NULL,
              name_ru VARCHAR(100) NOT NULL,
              name_uz VARCHAR(100) NOT NULL,
              name_en VARCHAR(100) NOT NULL,
              type VARCHAR(20) NOT NULL,
              is_filterable BOOLEAN DEFAULT false,
              is_active BOOLEAN DEFAULT true,
              created_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log('✅ Created characteristics table');

        // Characteristic Options
        await query(`
            CREATE TABLE IF NOT EXISTS characteristic_options (
              id SERIAL PRIMARY KEY,
              characteristic_id INT REFERENCES characteristics(id) ON DELETE CASCADE,
              value VARCHAR(100) NOT NULL,
              label_ru VARCHAR(100),
              label_uz VARCHAR(100),
              label_en VARCHAR(100),
              order_index INT DEFAULT 0
            );
        `);
        console.log('✅ Created characteristic_options table');

        // Category Characteristics Link
        await query(`
            CREATE TABLE IF NOT EXISTS category_characteristics (
              category_id INT REFERENCES categories(id) ON DELETE CASCADE,
              characteristic_id INT REFERENCES characteristics(id) ON DELETE CASCADE,
              is_required BOOLEAN DEFAULT false,
              show_in_key_specs BOOLEAN DEFAULT false,
              order_index INT DEFAULT 0,
              PRIMARY KEY (category_id, characteristic_id)
            );
        `);
        console.log('✅ Created category_characteristics table');

    } catch (e) {
        console.error('❌ Schema update failed:', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

updateSchema();
