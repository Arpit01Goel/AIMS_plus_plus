import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { recalculateStudentRecord } from '@/services/student-record.service';

/**
 * PATCH /api/enrollments/:id
 * Update enrollment (grade, status, etc.)
 * - Instructors can update grades
 * - Automatically recalculates student records
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: enrollmentId } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }


        const body = await request.json();
        const { grade, status, attendancePercentage } = body;

        // Verify enrollment exists
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: {
                student: true,
                offering: {
                    include: {
                        course: true,
                        primaryInstructor: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Enrollment not found' },
                { status: 404 }
            );
        }

        // Authorization check
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                instructor: true,
            },
        });

        // Only instructor of the course can update grades
        if (user?.role === 'INSTRUCTOR' && user.instructor) {
            if (enrollment.offering.instructorId !== user.instructor.id) {
                return NextResponse.json(
                    { error: 'You are not authorized to update this enrollment' },
                    { status: 403 }
                );
            }
        } else if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only instructors and admins can update enrollments' },
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: any = {
            updatedById: session.user.id,
        };

        if (grade !== undefined) {
            updateData.grade = grade;
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (attendancePercentage !== undefined) {
            updateData.attendancePercentage = attendancePercentage;
        }

        // Update enrollment
        const updatedEnrollment = await prisma.enrollment.update({
            where: { id: enrollmentId },
            data: updateData,
            include: {
                offering: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        // Recalculate student record in background (non-blocking)
        if (grade !== undefined) {
            recalculateStudentRecord(enrollment.studentId).catch((error) => {
                console.error('Failed to recalculate student record:', error);
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Enrollment updated successfully',
            enrollment: {
                id: updatedEnrollment.id,
                courseCode: updatedEnrollment.offering.course.code,
                courseName: updatedEnrollment.offering.course.title,
                grade: updatedEnrollment.grade,
                status: updatedEnrollment.status,
                attendance: updatedEnrollment.attendancePercentage,
            },
        });
    } catch (error) {
        console.error('Error updating enrollment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/enrollments/:id
 * Get enrollment details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        user: true,
                    },
                },
                offering: {
                    include: {
                        course: true,
                        academicSession: true,
                        primaryInstructor: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        if (!enrollment) {
            return NextResponse.json(
                { error: 'Enrollment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            enrollment: {
                id: enrollment.id,
                status: enrollment.status,
                enrollmentType: enrollment.enrollmentType,
                grade: enrollment.grade,
                attendance: enrollment.attendancePercentage,
                student: {
                    id: enrollment.student.id,
                    name: enrollment.student.user.name,
                    entryNumber: enrollment.student.entryNumber,
                },
                course: {
                    code: enrollment.offering.course.code,
                    title: enrollment.offering.course.title,
                    credits: enrollment.offering.course.credits,
                },
                session: {
                    code: enrollment.offering.academicSession.code,
                },
                instructor: {
                    name: enrollment.offering.primaryInstructor?.user.name || 'TBA',
                },
            },
        });
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
