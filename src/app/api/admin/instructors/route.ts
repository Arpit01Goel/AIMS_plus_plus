import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * GET /api/admin/instructors
 * Fetch all instructors (admin only)
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

        const instructors = await prisma.instructor.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        advisees: true,
                    },
                },
            },
            orderBy: {
                user: {
                    name: 'asc',
                },
            },
        });

        return NextResponse.json({ instructors }, { status: 200 });
    } catch (error) {
        console.error('Instructors GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch instructors' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/instructors
 * Create a new instructor (admin only)
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            name,
            email,
            password,
            title,
            officialEmail,
            departmentId,
        } = body;

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, password' },
                { status: 400 }
            );
        }

        // Validate email domain
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'iitrpr.ac.in';
        if (!email.endsWith(`@${allowedDomain}`)) {
            return NextResponse.json(
                { error: `Email must end with @${allowedDomain}` },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and instructor in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    role: 'INSTRUCTOR',
                },
            });

            // Create instructor profile
            const instructor = await tx.instructor.create({
                data: {
                    userId: user.id,
                    title: title || null,
                    officialEmail: officialEmail || email,
                    departmentId: departmentId || null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                    department: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                },
            });

            return instructor;
        });

        return NextResponse.json(
            {
                message: 'Instructor created successfully',
                instructor: result,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Instructor POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create instructor' },
            { status: 500 }
        );
    }
}
