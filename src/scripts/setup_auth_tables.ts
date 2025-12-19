
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config({ path: '.env.local' });
dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

async function main() {
    const client = await pool.connect();
    try {
        console.log('🔄 Setting up Auth Tables...');

        await client.query('BEGIN');

        // 1. Roles
        await client.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                slug VARCHAR(50) NOT NULL UNIQUE,
                description TEXT
            );
        `);

        // 2. Permissions
        await client.query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(100) NOT NULL UNIQUE,
                description TEXT
            );
        `);

        // 3. Role Permissions
        await client.query(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
                permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
                PRIMARY KEY (role_id, permission_id)
            );
        `);

        // 4. Users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100),
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
                status VARCHAR(20) DEFAULT 'active', -- active, blocked
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ Tables created.');

        // Seed Roles
        const roles = [
            { name: 'Super Admin', slug: 'super_admin', desc: 'Full access' },
            { name: 'Admin', slug: 'admin', desc: 'Operational management' },
            { name: 'Sales Manager', slug: 'sales_manager', desc: 'Orders and sales' }
        ];

        for (const role of roles) {
            await client.query(`
                INSERT INTO roles (name, slug, description)
                VALUES ($1, $2, $3)
                ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
            `, [role.name, role.slug, role.desc]);
        }
        console.log('✅ Roles seeded.');

        // Seed Permissions (Basic set based on TT)
        const resources = ['products', 'categories', 'users', 'roles', 'orders', 'characteristics', 'delivery', 'settings', 'logs'];
        const actions = ['view', 'create', 'update', 'delete'];

        for (const res of resources) {
            for (const act of actions) {
                const slug = `${res}.${act}`;
                await client.query(`
                    INSERT INTO permissions (slug, description)
                    VALUES ($1, $2)
                    ON CONFLICT (slug) DO NOTHING;
                `, [slug, `${act} ${res}`]);
            }
        }
        console.log('✅ Permissions seeded.');

        // Assign ALL permissions to Super Admin
        const superAdminRole = await client.query("SELECT id FROM roles WHERE slug = 'super_admin'");
        const allPerms = await client.query("SELECT id FROM permissions");

        if (superAdminRole.rows.length > 0) {
            const rid = superAdminRole.rows[0].id;
            for (const p of allPerms.rows) {
                await client.query(`
                    INSERT INTO role_permissions (role_id, permission_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING;
                `, [rid, p.id]);
            }
        }
        console.log('✅ Super Admin permissions assigned.');

        // Seed User
        const adminEmail = 'admin@antigravity.uz';
        const hashedPassword = await hashPassword('Admin123!'); // Stronger default

        await client.query(`
            INSERT INTO users (full_name, email, password_hash, role_id, status)
            VALUES ($1, $2, $3, (SELECT id FROM roles WHERE slug = 'super_admin'), 'active')
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = CASE WHEN users.password_hash IS NULL OR users.password_hash = '' THEN EXCLUDED.password_hash ELSE users.password_hash END;
        `, ['Antigravity Admin', adminEmail, hashedPassword]);

        console.log(`✅ Super User '${adminEmail}' ensured.`);

        await client.query('COMMIT');
        console.log('🚀 Auth setup completed successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Error setup auth:', e);
    } finally {
        client.release();
    }
}

main().then(() => pool.end());
