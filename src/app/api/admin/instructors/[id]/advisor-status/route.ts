import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PATCH /api/admin/instructors/[id]/advisor-status
 * Toggle advisor status for an instructor
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const { isAdvisor, primaryCohort, advisorNotes } = body;

        if (typeof isAdvisor !== 'boolean') {
            return NextResponse.json(
                { error: 'isAdvisor must be a boolean value' },
                { status: 400 }
            );
        }

        // Check if instructor exists
        const instructor = await prisma.instructor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                department: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
            },
        });

        if (!instructor) {
            return NextResponse.json(
                { error: 'Instructor not found' },
                { status: 404 }
            );
        }

        // Update advisor status
        const updatedInstructor = await prisma.instructor.update({
            where: { id },
            data: {
                isAdvisor,
                primaryCohort: isAdvisor ? primaryCohort : null,
                advisorNotes: isAdvisor ? advisorNotes : null,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                department: {
                    select: {
                        name: true,
                        code: true,
                    },
                },
                advisees: {
                    select: {
                        id: true,
                        entryNumber: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            message: isAdvisor
                ? `${instructor.user.name} is now marked as an advisor`
                : `Advisor status removed from ${instructor.user.name}`,
            instructor: updatedInstructor,
        }, { status: 200 });
    } catch (error) {
        console.error('Advisor status update error:', error);
        return NextResponse.json(
            { error: 'Failed to update advisor status' },
            { status: 500 }
        );
    }
}
