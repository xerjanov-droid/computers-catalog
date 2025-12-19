import { NextRequest, NextResponse } from 'next/server';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        // In production, fetch from 'admin_users' table and verify hash
        // For now, check environment variable or basic hardcoded (for demo/seed)
        // The seed didn't create an admin user but created the table. 
        // I'll assume usage of env ADMIN_USERNAME/PASSWORD first as per .env.example

        const envUser = process.env.ADMIN_USERNAME || 'admin';
        const envPass = process.env.ADMIN_PASSWORD || 'admin';

        // Simple check
        if (username === envUser && password === envPass) {
            // Success
            const token = await signToken({ username, role: 'admin' });
            await setAuthCookie(token);
            return NextResponse.json({ success: true });
        }

        // DB check (future proofing)
        /*
        const res = await query('SELECT * FROM admin_users WHERE username = $1', [username]);
        if (res.rows.length > 0) {
          // compare hash
        }
        */

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
