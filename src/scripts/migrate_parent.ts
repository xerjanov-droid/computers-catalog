
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

async function migrate() {
    try {
        await client.connect();
        console.log('Adding parent_id column...');
        await client.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL');
        console.log('Migration done.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await client.end();
    }
}

migrate();
