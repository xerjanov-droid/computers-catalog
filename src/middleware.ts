import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Login sahifani butunlay o‘tkazib yuboramiz
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    // 2. Faqat qolgan admin sahifalar himoyalanadi
    if (pathname.startsWith("/admin")) {
        const token = req.cookies.get("admin_token")?.value;

        if (!token) {
            const url = req.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
