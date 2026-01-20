import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EnrollmentStatus, EnrollmentType } from '@prisma/client';

/**
 * POST /api/courses/actions
 * Perform actions on enrolled courses (drop, withdraw, convert to audit)
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

        const body = await request.json();
        const { offeringId, action } = body;

        if (!offeringId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields: offeringId and action' },
                { status: 400 }
            );
        }

        // Validate action type
        if (!['DROP', 'WITHDRAW', 'AUDIT'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action type' },
                { status: 400 }
            );
        }

        // Get student profile
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
        });

        if (!student) {
            return NextResponse.json(
                { error: 'Student profile not found' },
                { status: 404 }
            );
        }

        // Find enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_offeringId: {
                    studentId: student.id,
                    offeringId: offeringId,
                },
            },
            include: {
                offering: {
                    include: {
                        course: true,
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

        let updatedEnrollment;

        switch (action) {
            case 'DROP':
                // Delete the enrollment (drop before deadline)
                await prisma.enrollment.delete({
                    where: {
                        id: enrollment.id,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Course dropped successfully',
                    courseCode: enrollment.offering.course.code,
                });

            case 'WITHDRAW':
                // Update enrollment status to withdrawn (after deadline, appears on transcript)
                updatedEnrollment = await prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        status: EnrollmentStatus.WITHDRAWN_BY_STUDENT,
                        updatedById: session.user.id,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Withdrawn from course successfully',
                    enrollment: {
                        id: updatedEnrollment.id,
                        status: updatedEnrollment.status,
                        courseCode: enrollment.offering.course.code,
                    },
                });

            case 'AUDIT':
                // Convert enrollment type to audit
                if (enrollment.enrollmentType === EnrollmentType.AUDIT) {
                    return NextResponse.json(
                        { error: 'Course is already set to audit' },
                        { status: 400 }
                    );
                }

                updatedEnrollment = await prisma.enrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        enrollmentType: EnrollmentType.AUDIT,
                        updatedById: session.user.id,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Converted to audit successfully',
                    enrollment: {
                        id: updatedEnrollment.id,
                        enrollmentType: updatedEnrollment.enrollmentType,
                        courseCode: enrollment.offering.course.code,
                    },
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error performing course action:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
