import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/courses/student/schedule
 * Fetch student's timetable with all course meetings
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

        // Get current academic session
        const currentSession = await prisma.academicSession.findFirst({
            where: { isCurrent: true },
        });

        if (!currentSession) {
            return NextResponse.json(
                { error: 'No active academic session found' },
                { status: 404 }
            );
        }

        // Get student's enrollments with course meetings
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: {
                    in: ['ENROLLED', 'PENDING_INSTRUCTOR_APPROVAL', 'PENDING_ADVISOR_APPROVAL'],
                },
            },
            include: {
                offering: {
                    include: {
                        course: true,
                        courseMeetings: true,
                        academicSession: true,
                    },
                },
            },
        });

        // Filter enrollments for current session only
        const currentSessionEnrollments = enrollments.filter(
            (enrollment) => enrollment.offering.academicSessionId === currentSession.id
        );

        // Format schedule data
        const schedule = currentSessionEnrollments.flatMap((enrollment) => {
            return enrollment.offering.courseMeetings.map((meeting) => ({
                id: meeting.id,
                courseCode: enrollment.offering.course.code,
                courseTitle: enrollment.offering.course.title,
                dayOfWeek: meeting.dayOfWeek,
                startTime: meeting.startTime,
                endTime: meeting.endTime,
                location: meeting.location || 'TBA',
                slot: enrollment.offering.slot || 'TBA',
                credits: enrollment.offering.course.credits,
            }));
        });

        // Sort by day and time
        schedule.sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek) {
                return a.dayOfWeek - b.dayOfWeek;
            }
            return a.startTime.localeCompare(b.startTime);
        });

        return NextResponse.json({
            schedule,
            totalCourses: currentSessionEnrollments.length,
            session: {
                code: currentSession.code,
                startDate: currentSession.startDate,
                endDate: currentSession.endDate,
            },
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
