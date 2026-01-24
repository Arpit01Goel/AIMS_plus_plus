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

    // Get advisor profile - instructors can also be advisors
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructor || !instructor.isAdvisor) {
      return NextResponse.json({ error: 'No advisor profile found. You must be assigned as an advisor to access this.' }, { status: 403 });
    }

    // Get all pending enrollments for students under this advisor
    const pendingEnrollments = await prisma.enrollment.findMany({
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
                email: true,
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
        },
        offering: {
          include: {
            course: true,
            academicSession: true,
            primaryInstructor: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format the data for frontend
    const formattedEnrollments = pendingEnrollments.map((enrollment) => {
      // Calculate current enrolled credits for this academic session
      const currentSessionCredits = enrollment.student.enrollments
        .filter(
          (e) => e.offering.academicSessionId === enrollment.offering.academicSessionId
        )
        .reduce((sum, e) => sum + e.offering.course.credits, 0);

      return {
        id: enrollment.id,
        studentId: enrollment.student.id,
        studentName: enrollment.student.user.name || 'N/A',
        studentEmail: enrollment.student.user.email,
        orgId: enrollment.student.entryNumber,
        courseCode: enrollment.offering.course.code,
        courseTitle: enrollment.offering.course.title,
        credits: enrollment.offering.course.credits,
        session: enrollment.offering.academicSession.code,
        enrollType: enrollment.enrollmentType,
        status: enrollment.status,
        submittedDate: enrollment.createdAt.toISOString(),
        instructorName: enrollment.offering.primaryInstructor?.user.name || 'N/A',
        currentCredits: currentSessionCredits,
        slot: enrollment.offering.slot,
      };
    });

    return NextResponse.json({
      enrollments: formattedEnrollments,
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

