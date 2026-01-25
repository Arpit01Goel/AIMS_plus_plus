import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/departments
 * Fetch all departments with their programs (admin only)
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

        const departments = await prisma.department.findMany({
            include: {
                programs: {
                    orderBy: {
                        name: 'asc',
                    },
                },
                _count: {
                    select: {
                        students: true,
                        instructors: true,
                        courses: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ departments }, { status: 200 });
    } catch (error) {
        console.error('Departments GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch departments' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/departments
 * Create a new department (admin only)
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
        const { code, name } = body;

        // Validation
        if (!code || !name) {
            return NextResponse.json(
                { error: 'Department code and name are required' },
                { status: 400 }
            );
        }

        // Validate code format (uppercase letters, numbers, and hyphens only)
        const codeRegex = /^[A-Z0-9-]+$/;
        if (!codeRegex.test(code)) {
            return NextResponse.json(
                { error: 'Department code must contain only uppercase letters, numbers, and hyphens' },
                { status: 400 }
            );
        }

        // Check if department with same code already exists
        const existingDept = await prisma.department.findUnique({
            where: { code },
        });

        if (existingDept) {
            return NextResponse.json(
                { error: 'A department with this code already exists' },
                { status: 409 }
            );
        }

        // Create the department
        const department = await prisma.department.create({
            data: {
                code: code.trim().toUpperCase(),
                name: name.trim(),
            },
            include: {
                programs: true,
                _count: {
                    select: {
                        students: true,
                        instructors: true,
                        courses: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: 'Department created successfully',
                department
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Department POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create department' },
            { status: 500 }
        );
    }
}
