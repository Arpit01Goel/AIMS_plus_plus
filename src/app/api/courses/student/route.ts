import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/courses
 * Fetch all available courses and enrollment status for the current student
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[COURSES API] Session user:', session.user);
        console.log('[COURSES API] Looking for student with userId:', session.user.id);

        // Get student profile
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                department: true,
                program: true,
            },
        });

        console.log('[COURSES API] Student found:', student ? `Yes (ID: ${student.id})` : 'No');

        if (!student) {
            console.log('[COURSES API] Returning 404: Student profile not found');
            return NextResponse.json(
                { error: 'Student profile not found' },
                { status: 404 }
            );
        }

        // Get current academic session
        const currentSession = await prisma.academicSession.findFirst({
            where: { isCurrent: true },
        });

        console.log('[COURSES API] Current session found:', currentSession ? `Yes (${currentSession.code})` : 'No');

        if (!currentSession) {
            console.log('[COURSES API] Returning 404: No active academic session');
            return NextResponse.json(
                { error: 'No active academic session found' },
                { status: 404 }
            );
        }

        // Fetch all course offerings for current session
        const offerings = await prisma.courseOffering.findMany({
            where: {
                academicSessionId: currentSession.id,
            },
            include: {
                course: {
                    include: {
                        department: true,
                    },
                },
                primaryInstructor: {
                    include: {
                        user: true,
                    },
                },
                enrollments: {
                    where: {
                        studentId: student.id,
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        // Create a map of enrolled offering IDs for quick lookup
        const enrolledOfferingIds = new Set(
            offerings
                .filter((o) => o.enrollments.length > 0)
                .map((o) => o.id)
        );

        // Format courses for frontend
        const courses = offerings.map((offering) => {
            const enrollment = offering.enrollments[0]; // Student's enrollment if exists

            return {
                id: offering.id,
                courseCode: offering.course.code,
                title: offering.course.title,
                ltpsc: offering.course.ltpsc || 'N/A',
                credits: offering.course.credits,
                status: offering.status.toLowerCase() as 'enrolling' | 'running' | 'completed',
                session: currentSession.code,
                enrolments: offering._count.enrollments,
                department: offering.course.department?.name || 'Unknown Department',
                slot: offering.slot || 'TBA',
                instructors: offering.primaryInstructor
                    ? [offering.primaryInstructor.user?.name || 'Unknown Instructor']
                    : ['TBA'],
                isEnrolled: enrolledOfferingIds.has(offering.id),
                enrollmentType: enrollment?.enrollmentType,
                enrollmentStatus: enrollment?.status,
                grade: enrollment?.grade,
            };
        });

        return NextResponse.json({
            courses,
            student: {
                name: session.user.name,
                entryNumber: student.entryNumber,
                program: student.program?.name,
                department: student.department?.name,
            },
            session: {
                code: currentSession.code,
                startDate: currentSession.startDate,
                endDate: currentSession.endDate,
            },
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
