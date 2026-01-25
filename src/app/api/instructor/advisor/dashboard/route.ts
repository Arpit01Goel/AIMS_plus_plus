import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden - Instructor role required' }, { status: 403 });
    }

    // Get instructor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 });
    }

    // Check if instructor is an advisor
    if (!instructor.isAdvisor) {
      return NextResponse.json({ error: 'Forbidden - Advisor privileges required' }, { status: 403 });
    }

    // Get total students count
    const totalStudents = await prisma.student.count({
      where: { advisorId: instructor.id },
    });

    // Get pending approvals count
    const pendingApprovalsCount = await prisma.enrollment.count({
      where: {
        status: 'PENDING_ADVISOR_APPROVAL',
        student: {
          advisorId: instructor.id,
        },
      },
    });

    // Get current academic session
    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    // Get students with credit violations (more than 26 credits)
    const MAX_CREDITS = 26;
    const students = await prisma.student.findMany({
      where: { advisorId: instructor.id },
      include: {
        enrollments: {
          where: {
            status: 'ENROLLED',
            ...(currentSession && {
              offering: {
                academicSessionId: currentSession.id,
              },
            }),
          },
          include: {
            offering: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    const creditViolations = students.filter((student) => {
      const totalCredits = student.enrollments.reduce(
        (sum, e) => sum + e.offering.course.credits,
        0
      );
      return totalCredits > MAX_CREDITS;
    }).length;

    // Calculate average CGPA
    const gradePoints: Record<string, number> = {
      'A': 10, 'A_MINUS': 9, 'B': 8, 'B_MINUS': 7,
      'C': 6, 'C_MINUS': 5, 'D': 4, 'E': 3, 'F': 0,
    };

    let totalGPA = 0;
    let studentsWithGrades = 0;

    students.forEach((student) => {
      let totalGradePoints = 0;
      let totalCredits = 0;

      student.enrollments
        .filter((e) => e.grade && gradePoints[e.grade] !== undefined)
        .forEach((e) => {
          totalGradePoints += gradePoints[e.grade!] * e.offering.course.credits;
          totalCredits += e.offering.course.credits;
        });

      if (totalCredits > 0) {
        totalGPA += totalGradePoints / totalCredits;
        studentsWithGrades++;
      }
    });

    const avgGPA = studentsWithGrades > 0 ? totalGPA / studentsWithGrades : 0;

    // Get recent pending enrollments for quick view
    const recentPendingEnrollments = await prisma.enrollment.findMany({
      where: {
        status: 'PENDING_ADVISOR_APPROVAL',
        student: {
          advisorId: instructor.id,
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        offering: {
          include: {
            course: true,
            academicSession: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Get recent activity (last 10 approved/rejected enrollments)
    const recentActivity = await prisma.enrollment.findMany({
      where: {
        student: {
          advisorId: instructor.id,
        },
        status: {
          in: ['ENROLLED', 'REJECTED_BY_ADVISOR'],
        },
        updatedById: session.user.id,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        offering: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });

    const formattedPendingEnrollments = recentPendingEnrollments.map((e) => ({
      id: e.id,
      studentName: e.student.user.name || 'N/A',
      studentId: e.student.entryNumber,
      course: `${e.offering.course.code} - ${e.offering.course.title}`,
      session: e.offering.academicSession.code,
      type: e.enrollmentType,
      submittedDate: e.createdAt.toISOString().split('T')[0],
    }));

    const formattedActivity = recentActivity.map((e) => ({
      id: e.id,
      message: `${e.status === 'ENROLLED' ? 'Approved' : 'Rejected'} enrollment for ${e.student.user.name} in ${e.offering.course.code}`,
      time: formatRelativeTime(e.updatedAt),
      type: e.status === 'ENROLLED' ? 'approval' : 'rejection',
    }));

    return NextResponse.json({
      stats: {
        pendingApprovals: pendingApprovalsCount,
        totalStudents,
        creditViolations,
        avgGPA: parseFloat(avgGPA.toFixed(2)),
      },
      pendingEnrollments: formattedPendingEnrollments,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error('Error fetching advisor dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

