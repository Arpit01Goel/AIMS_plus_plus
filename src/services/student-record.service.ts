import { prisma } from '@/lib/db';

interface SemesterMetrics {
    semesterCode: string;
    semesterName: string;
    sgpa: number;
    cgpa: number;
    totalCredits: number;
    earnedCredits: number;
    courses: CourseGrade[];
}

interface CourseGrade {
    courseCode: string;
    courseName: string;
    credits: number;
    grade: string | null;
    gradePoints: number;
    category: string;
    attendance: number;
    enrollmentStatus: string;
}

/**
 * Recalculate student's academic record
 * Called after enrollment changes (grade updates, enrollment/drop)
 */
export async function recalculateStudentRecord(studentId: string) {
    console.log(`📊 Recalculating record for student: ${studentId}`);

    try {
        // Fetch all enrollments with relations
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
                status: {
                    in: ['ENROLLED'], // Only count enrolled courses
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
            orderBy: {
                offering: {
                    academicSession: {
                        code: 'asc',
                    },
                },
            },
        });

        // Group enrollments by semester
        const semesterMap = new Map<string, typeof enrollments>();

        for (const enrollment of enrollments) {
            const sessionCode = enrollment.offering.academicSession.code;
            if (!semesterMap.has(sessionCode)) {
                semesterMap.set(sessionCode, []);
            }
            semesterMap.get(sessionCode)!.push(enrollment);
        }

        // Calculate metrics for each semester
        const semesterMetrics: SemesterMetrics[] = [];
        let cumulativePoints = 0;
        let cumulativeCredits = 0;
        let cumulativeEarnedCredits = 0;

        for (const [sessionCode, sessionEnrollments] of semesterMap) {
            const session = sessionEnrollments[0].offering.academicSession;

            const courses: CourseGrade[] = [];
            let semesterPoints = 0;
            let semesterCredits = 0;
            let earnedCredits = 0;

            for (const enrollment of sessionEnrollments) {
                const course = enrollment.offering.course;
                const gradePoints = calculateGradePoints(enrollment.grade || '');
                const points = gradePoints * course.credits;

                courses.push({
                    courseCode: course.code,
                    courseName: course.title,
                    credits: course.credits,
                    grade: enrollment.grade,
                    gradePoints,
                    category: course.category,
                    attendance: enrollment.attendancePercentage || 0,
                    enrollmentStatus: enrollment.status,
                });

                semesterPoints += points;
                semesterCredits += course.credits;

                // Count earned credits (grade not F, I, or null)
                if (enrollment.grade && !['F', 'I'].includes(enrollment.grade)) {
                    earnedCredits += course.credits;
                }
            }

            cumulativePoints += semesterPoints;
            cumulativeCredits += semesterCredits;
            cumulativeEarnedCredits += earnedCredits;

            const sgpa = semesterCredits > 0 ? semesterPoints / semesterCredits : 0;
            const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

            semesterMetrics.push({
                semesterCode: sessionCode,
                semesterName: formatSemesterName(session.startDate, session.endDate),
                sgpa: Math.round(sgpa * 100) / 100,
                cgpa: Math.round(cgpa * 100) / 100,
                totalCredits: semesterCredits,
                earnedCredits,
                courses,
            });
        }

        // Calculate overall metrics
        const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

        // Upsert StudentRecord
        await prisma.studentRecord.upsert({
            where: { studentId },
            update: {
                cgpa: Math.round(cgpa * 100) / 100,
                totalCredits: cumulativeCredits,
                totalEarnedCredits: cumulativeEarnedCredits,
                semestersData: semesterMetrics as any,
                lastCalculated: new Date(),
            },
            create: {
                studentId,
                cgpa: Math.round(cgpa * 100) / 100,
                totalCredits: cumulativeCredits,
                totalEarnedCredits: cumulativeEarnedCredits,
                semestersData: semesterMetrics as any,
            },
        });

        console.log(`✅ Successfully recalculated record for student: ${studentId}`);
        console.log(`   CGPA: ${Math.round(cgpa * 100) / 100}, Credits: ${cumulativeCredits}, Earned: ${cumulativeEarnedCredits}`);
    } catch (error) {
        console.error(`❌ Failed to recalculate record for student: ${studentId}`, error);
        throw error;
    }
}

/**
 * Calculate grade points from letter grade
 */
function calculateGradePoints(grade: string): number {
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
        'P': 0, // Pass (no points)
    };
    return gradeMap[grade] || 0;
}

/**
 * Format semester name from dates
 */
function formatSemesterName(startDate: Date, endDate: Date): string {
    const startMonth = startDate.toLocaleString('default', { month: 'short' });
    const endMonth = endDate.toLocaleString('default', { month: 'short' });
    const year = endDate.getFullYear();
    return `${startMonth}-${endMonth} ${year}`;
}
