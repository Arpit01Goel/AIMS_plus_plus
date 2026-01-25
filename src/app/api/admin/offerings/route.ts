import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/offerings
 * Fetch all course offerings with details (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const academicSessionId = searchParams.get('academicSessionId');
        const status = searchParams.get('status');

        const where: any = {};
        if (academicSessionId && academicSessionId !== 'all') {
            where.academicSessionId = academicSessionId;
        }
        if (status && status !== 'all') {
            where.status = status;
        }

        const offerings = await prisma.courseOffering.findMany({
            where,
            include: {
                course: {
                    select: {
                        code: true,
                        title: true,
                        department: {
                            select: {
                                name: true,
                                code: true,
                            }
                        }
                    },
                },
                academicSession: {
                    select: {
                        id: true,
                        code: true,
                    },
                },
                primaryInstructor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
            orderBy: {
                course: {
                    code: 'asc',
                },
            },
        });

        // Also fetch all academic sessions for the filter
        const sessions = await prisma.academicSession.findMany({
            orderBy: {
                startDate: 'desc',
            },
        });

        return NextResponse.json({ offerings, sessions }, { status: 200 });
    } catch (error) {
        console.error('Offerings GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch offerings' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/offerings
 * Float a new course offering (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            courseId,
            academicSessionId,
            instructorId,
            capacity,
            slot,
            status
        } = body;

        // Validation
        if (!courseId || !academicSessionId) {
            return NextResponse.json(
                { error: 'Course and Academic Session are required' },
                { status: 400 }
            );
        }

        // Check if offering already exists for this course and session
        const existingOffering = await prisma.courseOffering.findUnique({
            where: {
                courseId_academicSessionId: {
                    courseId,
                    academicSessionId,
                },
            },
        });

        if (existingOffering) {
            return NextResponse.json(
                { error: 'This course is already offered in the selected session' },
                { status: 409 }
            );
        }

        // Create offering
        const offering = await prisma.courseOffering.create({
            data: {
                courseId,
                academicSessionId,
                instructorId: instructorId || null,
                capacity: capacity ? parseInt(capacity) : 60,
                slot: slot || null,
                status: status || 'ENROLLING',
            },
            include: {
                course: {
                    select: {
                        code: true,
                        title: true,
                    },
                },
                academicSession: {
                    select: {
                        code: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: 'Course offering floated successfully',
                offering,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Offering POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create course offering' },
            { status: 500 }
        );
    }
}
