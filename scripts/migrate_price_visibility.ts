
import { query } from '../src/lib/db';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    try {
        console.log('Running migration...');
        await query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_price_visible BOOLEAN DEFAULT true;`);
        console.log('Migration successful: is_price_visible added.');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

migrate();
