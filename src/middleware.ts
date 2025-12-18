import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        if (path === '/admin/login') {
            return NextResponse.next();
        }

        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            // If API, return 401
            if (path.startsWith('/api')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
