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

    if (session.user.role !== 'ADVISOR') {
      return NextResponse.json({ error: 'Forbidden - Advisor role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Get advisor profile
    const advisor = await prisma.advisor.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor profile not found' }, { status: 404 });
    }

    // Get student details
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        program: true,
        department: true,
      },
    });

    if (!student || student.advisorId !== advisor.id) {
      return NextResponse.json({ error: 'Student not found or not under your advisement' }, { status: 404 });
    }

    // Get current session
    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    // Get current enrollments
    const currentEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        offering: currentSession ? {
          academicSessionId: currentSession.id,
        } : undefined,
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
        createdAt: 'desc',
      },
    });

    // Get enrollment history (completed courses with grades)
    const enrollmentHistory = await prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        status: 'ENROLLED',
        grade: { not: null },
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
        updatedAt: 'desc',
      },
    });

    // Calculate semester performance
    const gradePoints: Record<string, number> = {
      'A': 10, 'A_MINUS': 9, 'B': 8, 'B_MINUS': 7,
      'C': 6, 'C_MINUS': 5, 'D': 4, 'E': 3, 'F': 0,
    };

    const sessionPerformance = new Map<string, { credits: number; gradePoints: number }>();
    
    enrollmentHistory.forEach((e) => {
      if (!e.grade || !(e.grade in gradePoints)) return;
      
      const sessionCode = e.offering.academicSession.code;
      const current = sessionPerformance.get(sessionCode) || { credits: 0, gradePoints: 0 };
      
      current.credits += e.offering.course.credits;
      current.gradePoints += gradePoints[e.grade] * e.offering.course.credits;
      
      sessionPerformance.set(sessionCode, current);
    });

    const semesterPerformance = Array.from(sessionPerformance.entries()).map(([session, data]) => ({
      semester: session,
      sgpa: data.credits > 0 ? parseFloat((data.gradePoints / data.credits).toFixed(2)) : 0,
      credits: data.credits,
    }));

    // Calculate credit breakdown by category
    const creditsByCategory = new Map<string, number>();
    enrollmentHistory.forEach((e) => {
      if (!e.grade || e.grade === 'F' || e.grade === 'W') return;
      const category = e.offering.course.category;
      creditsByCategory.set(category, (creditsByCategory.get(category) || 0) + e.offering.course.credits);
    });

    const creditBreakdown = Array.from(creditsByCategory.entries()).map(([category, earned]) => ({
      category,
      earned,
    }));

    return NextResponse.json({
      student: {
        id: student.id,
        orgId: student.entryNumber,
        name: student.user.name || 'N/A',
        email: student.user.email,
        program: student.program?.name || 'N/A',
        department: student.department?.name || 'N/A',
        batch: student.batch,
      },
      currentEnrollments: currentEnrollments.map((e) => ({
        courseCode: e.offering.course.code,
        courseTitle: e.offering.course.title,
        session: e.offering.academicSession.code,
        credits: e.offering.course.credits,
        grade: e.grade || '-',
        status: e.status,
      })),
      enrollmentHistory: enrollmentHistory.map((e) => ({
        courseCode: e.offering.course.code,
        courseTitle: e.offering.course.title,
        session: e.offering.academicSession.code,
        credits: e.offering.course.credits,
        grade: e.grade || '-',
      })),
      semesterPerformance,
      creditBreakdown,
    });
  } catch (error) {
    console.error('Error fetching student monitoring data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
