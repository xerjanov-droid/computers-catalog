
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
        console.log('🔄 Resetting Admin Password...');

        const email = 'admin@antigravity.uz';
        const password = 'Admin123!';
        const hash = await hashPassword(password);

        // Force Update
        const res = await client.query(`
            UPDATE users 
            SET password_hash = $1, status = 'active'
            WHERE email = $2
            RETURNING id, email, role_id;
        `, [hash, email]);

        if (res.rowCount === 0) {
            console.log('⚠️ User not found. Creating...');
            // Fallback create
            await client.query(`
                INSERT INTO users (full_name, email, password_hash, role_id, status)
                VALUES ('Antigravity Admin', $1, $2, (SELECT id FROM roles WHERE slug = 'super_admin'), 'active')
            `, [email, hash]);
            console.log('✅ User created.');
        } else {
            console.log(`✅ Password updated for user ID: ${res.rows[0].id}`);
        }

    } catch (e) {
        console.error('❌ Error resetting password:', e);
    } finally {
        client.release();
    }
}

main().then(() => pool.end());
