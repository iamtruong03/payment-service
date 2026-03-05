import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const ADMIN_ROUTES = ['/dashboard/users'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.some((r) => pathname === r) || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Check for auth token in cookies (set by Zustand persist)
    const authStorage = request.cookies.get('auth-storage');
    let token: string | null = null;
    let role: string | null = null;

    if (authStorage) {
        try {
            const parsed = JSON.parse(decodeURIComponent(authStorage.value));
            token = parsed?.state?.token ?? null;
            role = parsed?.state?.user?.role ?? null;
        } catch {
            token = null;
        }
    }

    // Not authenticated → redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/profile/:path*'],
};
