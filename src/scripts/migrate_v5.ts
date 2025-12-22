
import dotenv from 'dotenv';
dotenv.config();

import { query } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function migrate() {
    try {
        console.log('Reading migration file...');
        const sqlPath = path.join(__dirname, '../lib/schema_v5_settings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing migration...');
        await query(sql);
        console.log('Migration v5 completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
