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
        pattern: /^\/student/,
        requiredRole: 'STUDENT',
        portalHome: '/student',
    },
    {
        pattern: /^\/instructor/,
        requiredRole: 'INSTRUCTOR',
        portalHome: '/instructor/dashboard',
    },
    {
        pattern: /^\/advisor/,
        requiredRole: 'ADVISOR',
        portalHome: '/advisor/dashboard',
    },
    {
        pattern: /^\/admin/,
        requiredRole: 'ADMIN',
        portalHome: '/admin/dashboard',
    },
];

const ROLE_PORTAL_HOMES: Record<UserRole, string> = {
    STUDENT: '/student',
    INSTRUCTOR: '/instructor/dashboard',
    ADVISOR: '/advisor/dashboard',
    ADMIN: '/admin/dashboard',
};

export async function proxy(request: NextRequest) {
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
        const loginUrl = new URL('/login', request.url);
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
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: [
        '/student/:path*',
        '/instructor/:path*',
        '/advisor/:path*',
        '/admin/:path*',
    ],
};
