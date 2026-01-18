import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADVISOR' | 'ADMIN';

interface RouteConfig {
    pattern: RegExp;
    requiredRole: UserRole;
    portalHome: string;
}

const ROUTE_CONFIGS: RouteConfig[] = [
    {
        pattern: /^\/student\/\(portal\)/,
        requiredRole: 'STUDENT',
        portalHome: '/student/(portal)/dashboard',
    },
    {
        pattern: /^\/instructor\/\(portal\)/,
        requiredRole: 'INSTRUCTOR',
        portalHome: '/instructor/(portal)/dashboard',
    },
    {
        pattern: /^\/advisor\/\(portal\)/,
        requiredRole: 'ADVISOR',
        portalHome: '/advisor/(portal)/dashboard',
    },
    {
        pattern: /^\/admin\/\(portal\)/,
        requiredRole: 'ADMIN',
        portalHome: '/admin/(portal)/dashboard',
    },
];

const ROLE_PORTAL_HOMES: Record<UserRole, string> = {
    STUDENT: '/student/(portal)/dashboard',
    INSTRUCTOR: '/instructor/(portal)/dashboard',
    ADVISOR: '/advisor/(portal)/dashboard',
    ADMIN: '/admin/(portal)/dashboard',
};

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Find which portal route is being accessed
    const routeConfig = ROUTE_CONFIGS.find((config) =>
        config.pattern.test(pathname)
    );

    // If not a protected route, allow access
    if (!routeConfig) {
        return NextResponse.next();
    }

    // Get the JWT token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // If no token (unauthenticated), redirect to login with callback URL
    if (!token) {
        const loginUrl = new URL('/(auth)/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as UserRole;

    // If user has the correct role, allow access
    if (userRole === routeConfig.requiredRole) {
        return NextResponse.next();
    }

    // User is authenticated but has wrong role
    // Redirect to their appropriate portal home
    const correctPortalHome = ROLE_PORTAL_HOMES[userRole];
    if (correctPortalHome) {
        return NextResponse.redirect(new URL(correctPortalHome, request.url));
    }

    // Fallback: if role is not recognized, redirect to login
    return NextResponse.redirect(new URL('/(auth)/login', request.url));
}

export const config = {
    matcher: [
        '/student/(portal)/:path*',
        '/instructor/(portal)/:path*',
        '/advisor/(portal)/:path*',
        '/admin/(portal)/:path*',
    ],
};
