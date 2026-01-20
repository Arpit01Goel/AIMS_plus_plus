import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EnrollmentType, EnrollmentStatus } from '@prisma/client';

/**
 * POST /api/courses/enroll
 * Enroll student in a course with specified enrollment type
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
        const { offeringId, enrollmentType } = body;

        if (!offeringId || !enrollmentType) {
            return NextResponse.json(
                { error: 'Missing required fields: offeringId and enrollmentType' },
                { status: 400 }
            );
        }

        // Validate enrollment type
        if (!['CREDIT', 'AUDIT', 'CREDIT_MINOR', 'CREDIT_CONCENTRATION'].includes(enrollmentType)) {
            return NextResponse.json(
                { error: 'Invalid enrollment type' },
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

        // Check if course offering exists and is available for enrollment
        const offering = await prisma.courseOffering.findUnique({
            where: { id: offeringId },
            include: {
                course: true,
                _count: {
                    select: {
                        enrollments: {
                            where: {
                                status: {
                                    in: ['ENROLLED', 'PENDING_INSTRUCTOR_APPROVAL', 'PENDING_ADVISOR_APPROVAL'],
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!offering) {
            return NextResponse.json(
                { error: 'Course offering not found' },
                { status: 404 }
            );
        }

        if (offering.status !== 'ENROLLING') {
            return NextResponse.json(
                { error: 'Course is not open for enrollment' },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_offeringId: {
                    studentId: student.id,
                    offeringId: offering.id,
                },
            },
        });

        if (existingEnrollment) {
            return NextResponse.json(
                { error: 'Already enrolled in this course' },
                { status: 400 }
            );
        }

        // Check capacity
        if (offering.capacity && offering._count.enrollments >= offering.capacity) {
            return NextResponse.json(
                { error: 'Course is full' },
                { status: 400 }
            );
        }

        // Create enrollment with pending instructor approval
        const enrollment = await prisma.enrollment.create({
            data: {
                studentId: student.id,
                offeringId: offering.id,
                enrollmentType: enrollmentType as EnrollmentType,
                status: EnrollmentStatus.PENDING_INSTRUCTOR_APPROVAL,
                createdById: session.user.id,
            },
            include: {
                offering: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Enrollment request submitted successfully',
            enrollment: {
                id: enrollment.id,
                courseCode: enrollment.offering.course.code,
                courseTitle: enrollment.offering.course.title,
                enrollmentType: enrollment.enrollmentType,
                status: enrollment.status,
            },
        });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
