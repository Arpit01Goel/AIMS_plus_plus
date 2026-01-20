import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/student/records
 * Fetch student's academic records with semester-wise course data
 * - Previous semesters: from cached StudentRecord.semestersData
 * - Current semester: from live Enrollment data
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

        // Get student profile with enrollments
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                record: true,
                enrollments: {
                    where: {
                        status: {
                            in: ['ENROLLED', 'PENDING_INSTRUCTOR_APPROVAL', 'PENDING_ADVISOR_APPROVAL', 'DROPPED'],
                        },
                    },
                    include: {
                        offering: {
                            include: {
                                course: true,
                                academicSession: true,
                            },
                        },
                    },
                },
            },
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

        // If no student record exists, only show current semester if exists
        if (!student.record || !student.record.semestersData) {
            const currentSemester = currentSession ? buildCurrentSemester(student, currentSession) : null;
            return NextResponse.json({
                cgpa: student.record?.cgpa || 0,
                totalCredits: student.record?.totalCredits || 0,
                semesters: currentSemester ? [currentSemester] : [],
                degreePrograms: [],
            });
        }

        // Get cached semester data (only previous semesters, exclude current)
        const cachedSemesters = student.record.semestersData as any[];
        const previousSemesters = currentSession
            ? cachedSemesters.filter(sem => sem.semesterCode !== currentSession.code)
            : cachedSemesters;

        // Build current semester from live enrollments
        const currentSemester = currentSession ? buildCurrentSemester(student, currentSession) : null;

        // Combine: current semester first, then previous semesters
        const allSemesters = currentSemester
            ? [currentSemester, ...previousSemesters.map(sem => ({ ...sem, isCurrent: false }))]
            : previousSemesters.map(sem => ({ ...sem, isCurrent: false }));

        return NextResponse.json({
            cgpa: student.record.cgpa,
            totalCredits: student.record.totalCredits,
            semesters: allSemesters,
            degreePrograms: [], // TODO: Implement minor/concentration support
        });
    } catch (error) {
        console.error('Error fetching student records:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Build current semester from live enrollments
 */
function buildCurrentSemester(student: any, currentSession: any) {
    // Filter enrollments for current session
    const currentEnrollments = student.enrollments.filter(
        (enrollment: any) => enrollment.offering.academicSession.code === currentSession.code
    );

    if (currentEnrollments.length === 0) {
        return null;
    }

    // Calculate current semester stats
    let totalCredits = 0;
    let earnedCredits = 0;
    let totalGradePoints = 0;

    const courses = currentEnrollments.map((enrollment: any) => {
        const course = enrollment.offering.course;
        const credits = course.credits;
        const gradePoints = getGradePoints(enrollment.grade || '');

        totalCredits += credits;
        if (enrollment.grade && enrollment.grade !== 'I' && enrollment.grade !== 'W') {
            earnedCredits += credits;
            totalGradePoints += gradePoints * credits;
        }

        return {
            courseCode: course.code,
            courseName: course.name,
            credits: credits,
            grade: enrollment.grade || '',
            gradePoints: gradePoints,
            category: course.category,
            attendance: enrollment.attendancePercentage || 0,
            enrollmentStatus: mapEnrollmentStatus(enrollment.status),
        };
    });

    const sgpa = earnedCredits > 0 ? totalGradePoints / earnedCredits : 0;

    return {
        semesterCode: currentSession.code,
        semesterName: formatSemesterName(currentSession.code),
        sgpa: Math.round(sgpa * 100) / 100,
        cgpa: student.record?.cgpa || 0,
        totalCredits: totalCredits,
        earnedCredits: earnedCredits,
        isCurrent: true,
        courses: courses,
    };
}

/**
 * Get grade points from letter grade
 */
function getGradePoints(grade: string): number {
    const gradeMap: Record<string, number> = {
        'A': 10,
        'A-': 9,
        'B': 8,
        'B-': 7,
        'C': 7,
        'C-': 6,
        'D': 5,
        'F': 0,
        'I': 0, // Incomplete
        'W': 0, // Withdrawn
        'P': 0, // Pass (no grade points)
    };
    return gradeMap[grade] || 0;
}

/**
 * Format semester code to readable name
 */
function formatSemesterName(code: string): string {
    // Example: "2025-I" -> "July-Dec 2025"
    const [year, term] = code.split('-');
    if (term === 'I') return `July-Dec ${year}`;
    if (term === 'II') return `Jan-May ${parseInt(year) + 1}`;
    if (term === 'S') return `May-July ${parseInt(year) + 1}`;
    return code;
}

/**
 * Map Prisma enrollment status to frontend format
 */
function mapEnrollmentStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'PENDING_INSTRUCTOR_APPROVAL': 'pending-instructor',
        'PENDING_ADVISOR_APPROVAL': 'pending-advisor',
        'ENROLLED': 'enrolled',
        'DROPPED': 'dropped',
    };
    return statusMap[status] || 'enrolled';
}
