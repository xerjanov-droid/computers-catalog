
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

    console.log(`Connecting to ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);

    // 1. Connect to default 'postgres' database to create the new DB
    const client = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: Number(DB_PORT),
        database: 'postgres',
    });

    try {
        await client.connect();

        // Check if DB exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
        if (res.rowCount === 0) {
            console.log(`Creating database ${DB_NAME}...`);
            await client.query(`CREATE DATABASE "${DB_NAME}"`);
        } else {
            console.log(`Database ${DB_NAME} already exists.`);
        }
    } catch (e) {
        console.error('Error checking/creating database:', e);
        process.exit(1);
    } finally {
        await client.end();
    }

    // 2. Connect to the target database and run schema/seed
    const targetClient = new Client({
        user: DB_USER,
        password: DB_PASSWORD,
        host: DB_HOST,
        port: Number(DB_PORT),
        database: DB_NAME,
    });

    try {
        await targetClient.connect();
        console.log(`Connected to ${DB_NAME}. Running schema...`);

        // Fix: Use process.cwd() to verify path relative to run location
        const schemaPath = path.join(process.cwd(), 'src/lib/schema.sql');
        console.log('Reading schema from:', schemaPath);
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await targetClient.query(schemaSql);
        console.log('Schema applied.');

        // Run Seed Check
        const catCheck = await targetClient.query('SELECT COUNT(*) FROM categories');
        if (catCheck.rows[0].count === '0') {
            console.log('Seeding initial data...');
            // We'll let the next command handle seeding
            console.log('Database schema ready. Proceeding to seed...');
        } else {
            console.log('Data already exists, skipping seed.');
        }

    } catch (e) {
        console.error('Error applying schema:', e);
    } finally {
        await targetClient.end();
    }
}

main();
