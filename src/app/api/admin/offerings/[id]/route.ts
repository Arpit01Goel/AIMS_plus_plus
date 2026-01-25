import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/admin/offerings/[id]
 * Fetch a single offering with full details and enrollments
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const offering = await prisma.courseOffering.findUnique({
            where: { id },
            include: {
                course: {
                    include: {
                        department: true,
                    }
                },
                academicSession: true,
                primaryInstructor: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                enrollments: {
                    include: {
                        student: {
                            include: {
                                user: {
                                    select: { name: true, email: true }
                                },
                                department: true,
                            }
                        }
                    },
                    orderBy: {
                        student: {
                            entryNumber: 'asc'
                        }
                    }
                },
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (!offering) {
            return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
        }

        return NextResponse.json({ offering }, { status: 200 });
    } catch (error) {
        console.error('Offering GET Details error:', error);
        return NextResponse.json({ error: 'Failed to fetch offering details' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/offerings/[id]
 * Update an existing offering
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { instructorId, capacity, slot, status } = body;

        const offering = await prisma.courseOffering.update({
            where: { id },
            data: {
                ...(instructorId !== undefined && { instructorId: instructorId || null }),
                ...(capacity !== undefined && { capacity: parseInt(capacity) }),
                ...(slot !== undefined && { slot: slot || null }),
                ...(status !== undefined && { status }),
            }
        });

        return NextResponse.json({ message: 'Offering updated successfully', offering }, { status: 200 });
    } catch (error) {
        console.error('Offering PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update offering' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/offerings/[id]
 * Delete an offering (only if no enrollments exist)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for enrollments
        const enrollmentCount = await prisma.enrollment.count({
            where: { offeringId: id }
        });

        if (enrollmentCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete offering with active enrollments. Remove students first.'
            }, { status: 409 });
        }

        await prisma.courseOffering.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Offering deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Offering DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete offering' }, { status: 500 });
    }
}
