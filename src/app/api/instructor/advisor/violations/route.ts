import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const MAX_CREDITS = 26;
const MIN_CREDITS = 12;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden - Instructor role required' }, { status: 403 });
    }

    // Get advisor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructor || !instructor.isAdvisor) {
      return NextResponse.json({ error: 'Instructor not found or not an advisor' }, { status: 404 });
    }

    // Get current academic session
    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });

    if (!currentSession) {
      return NextResponse.json({ violations: [] });
    }

    // Get all students under this advisor
    const students = await prisma.student.findMany({
      where: { advisorId: instructor.id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        enrollments: {
          where: {
            status: 'ENROLLED',
            offering: {
              academicSessionId: currentSession.id,
            },
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

    // Analyze violations
    const violations: any[] = [];

    students.forEach((student) => {
      const totalCredits = student.enrollments.reduce(
        (sum, e) => sum + e.offering.course.credits,
        0
      );

      // Check for excessive credits
      if (totalCredits > MAX_CREDITS) {
        violations.push({
          id: `excessive-${student.id}`,
          studentId: student.id,
          studentName: student.user.name || 'N/A',
          orgId: student.entryNumber,
          violationType: 'excessive',
          severity: 'high',
          description: `Student enrolled in ${totalCredits} credits, exceeding maximum limit of ${MAX_CREDITS}`,
          currentCredits: totalCredits,
          maxCredits: MAX_CREDITS,
          session: currentSession.code,
          reportedDate: new Date().toISOString(),
          status: 'pending',
        });
      }

      // Check for insufficient credits
      if (totalCredits < MIN_CREDITS && totalCredits > 0) {
        violations.push({
          id: `insufficient-${student.id}`,
          studentId: student.id,
          studentName: student.user.name || 'N/A',
          orgId: student.entryNumber,
          violationType: 'insufficient',
          severity: 'medium',
          description: `Student enrolled in only ${totalCredits} credits, below minimum of ${MIN_CREDITS}`,
          currentCredits: totalCredits,
          minCredits: MIN_CREDITS,
          session: currentSession.code,
          reportedDate: new Date().toISOString(),
          status: 'pending',
        });
      }

      // Check category requirements (example: Humanities)
      const humanitiesCredits = student.enrollments
        .filter((e) => e.offering.course.category === 'HE' || e.offering.course.category === 'HC')
        .reduce((sum, e) => sum + e.offering.course.credits, 0);

      const MIN_HUMANITIES = 6;
      if (humanitiesCredits < MIN_HUMANITIES && totalCredits >= MIN_CREDITS) {
        violations.push({
          id: `category-${student.id}`,
          studentId: student.id,
          studentName: student.user.name || 'N/A',
          orgId: student.entryNumber,
          violationType: 'category',
          severity: 'medium',
          description: `Insufficient humanities credits. Required: ${MIN_HUMANITIES}, Enrolled: ${humanitiesCredits}`,
          currentCredits: totalCredits,
          categoryDeficit: `Humanities (${MIN_HUMANITIES - humanitiesCredits} credits short)`,
          session: currentSession.code,
          reportedDate: new Date().toISOString(),
          status: 'pending',
        });
      }
    });

    return NextResponse.json({ violations });
  } catch (error) {
    console.error('Error fetching credit violations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

