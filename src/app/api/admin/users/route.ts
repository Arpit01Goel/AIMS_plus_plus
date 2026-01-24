import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/users
 * Fetch all users with their profiles (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const department = searchParams.get('department');
        const search = searchParams.get('search');

        // Build where clause
        const where: any = {};

        if (role && role !== 'all') {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                student: {
                    include: {
                        department: true,
                        program: true,
                        advisor: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                instructor: {
                    include: {
                        department: true,
                    },
                },
                admin: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Filter by department if specified
        let filteredUsers = users;
        if (department && department !== 'all') {
            filteredUsers = users.filter((user) => {
                if (user.student?.department?.code === department) return true;
                if (user.instructor?.department?.code === department) return true;
                return false;
            });
        }

        return NextResponse.json({ users: filteredUsers }, { status: 200 });
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
