import { NextRequest, NextResponse } from 'next/server';
import { signToken, setAuthCookie, verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json(); // username is email

        // DB check
        const res = await query(`
            SELECT u.*, r.slug as role_slug 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = $1
        `, [username]);

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = res.rows[0];

        if (user.status !== 'active') {
            return NextResponse.json({ error: 'Account is blocked' }, { status: 403 });
        }

        // Verify Hash
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Success
        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = await signToken({
            id: user.id,
            username: user.email,
            role: user.role_slug,
            fullName: user.full_name
        });

        await setAuthCookie(token);

        return NextResponse.json({ success: true, role: user.role_slug });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
