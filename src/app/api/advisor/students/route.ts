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

    // Get advisor profile
    const advisor = await prisma.advisor.findUnique({
      where: { userId: session.user.id },
      include: {
        department: true,
        program: true,
      },
    });

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor profile not found' }, { status: 404 });
    }

    // Get all students under this advisor
    const students = await prisma.student.findMany({
      where: {
        advisorId: advisor.id,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        program: {
          select: {
            code: true,
            name: true,
          },
        },
        department: {
          select: {
            code: true,
            name: true,
          },
        },
        enrollments: {
          where: {
            status: 'ENROLLED',
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
      orderBy: {
        entryNumber: 'asc',
      },
    });

    // Calculate statistics for each student
    const studentsWithStats = students.map((student) => {
      // Calculate credits earned (only ENROLLED courses with grades)
      const creditsEarned = student.enrollments
        .filter((e) => e.grade && e.grade !== 'F' && e.grade !== 'W' && e.grade !== 'I')
        .reduce((sum, e) => sum + e.offering.course.credits, 0);

      // Current enrollments
      const currentEnrollments = student.enrollments.filter(
        (e) => e.offering.academicSession.isCurrent
      ).length;

      // Calculate GPA (simplified - using grade points)
      const gradePoints: Record<string, number> = {
        'A': 10, 'A_MINUS': 9, 'B': 8, 'B_MINUS': 7, 
        'C': 6, 'C_MINUS': 5, 'D': 4, 'E': 3, 'F': 0
      };

      let totalGradePoints = 0;
      let totalCredits = 0;

      student.enrollments
        .filter((e) => e.grade && gradePoints[e.grade] !== undefined)
        .forEach((e) => {
          totalGradePoints += gradePoints[e.grade!] * e.offering.course.credits;
          totalCredits += e.offering.course.credits;
        });

      const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

      return {
        id: student.id,
        orgId: student.entryNumber,
        name: student.user.name || 'N/A',
        email: student.user.email,
        batch: student.batch,
        program: student.program?.name || 'N/A',
        department: student.department?.name || 'N/A',
        cgpa: parseFloat(cgpa.toFixed(2)),
        creditsEarned,
        currentEnrollments,
        phone: student.phone,
        address: student.address,
      };
    });

    return NextResponse.json({
      students: studentsWithStats,
      advisor: {
        id: advisor.id,
        primaryCohort: advisor.primaryCohort,
        department: advisor.department?.name,
        program: advisor.program?.name,
      },
    });
  } catch (error) {
    console.error('Error fetching advisor students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
