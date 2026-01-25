import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: enrollmentId } = await params;
    const body = await req.json();
    const { action, remarks } = body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get instructor profile - instructors can also be advisors
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
    });

    if (!instructor || !instructor.isAdvisor) {
      return NextResponse.json({ error: 'No instructor profile found or instructor is not an advisor. You must be assigned as an advisor to perform this action.' }, { status: 403 });
    }

    // Get the enrollment with student info
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        offering: {
          include: {
            course: true,
            academicSession: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Verify the student belongs to this advisor
    if (enrollment.student.advisorId !== instructor.id) {
      return NextResponse.json(
        { error: 'You are not authorized to approve this student' },
        { status: 403 }
      );
    }

    // Verify the enrollment is in pending advisor approval state
    if (enrollment.status !== 'PENDING_ADVISOR_APPROVAL') {
      return NextResponse.json(
        { error: 'Enrollment is not in pending advisor approval state' },
        { status: 400 }
      );
    }

    // Check credit limits if approving
    if (action === 'approve') {
      // Get all enrolled courses for this session
      const sessionEnrollments = await prisma.enrollment.findMany({
        where: {
          studentId: enrollment.studentId,
          status: 'ENROLLED',
          offering: {
            academicSessionId: enrollment.offering.academicSessionId,
          },
        },
        include: {
          offering: {
            include: {
              course: true,
            },
          },
        },
      });

      const currentCredits = sessionEnrollments.reduce(
        (sum, e) => sum + e.offering.course.credits,
        0
      );

      const newTotalCredits = currentCredits + enrollment.offering.course.credits;

      // Typical credit limits (can be made configurable)
      const MAX_CREDITS = 26;
      const MIN_CREDITS = 12;

      if (newTotalCredits > MAX_CREDITS) {
        return NextResponse.json(
          {
            error: `Approval would exceed maximum credit limit (${MAX_CREDITS}). Current: ${currentCredits}, Requested: ${enrollment.offering.course.credits}`,
          },
          { status: 400 }
        );
      }
    }

    // Update enrollment status
    const newStatus = action === 'approve' ? 'ENROLLED' : 'REJECTED_BY_ADVISOR';

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: newStatus,
        updatedById: session.user.id,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        offering: {
          include: {
            course: true,
            academicSession: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Enrollment ${action}d successfully`,
      enrollment: {
        id: updatedEnrollment.id,
        status: updatedEnrollment.status,
        studentName: updatedEnrollment.student.user.name,
        courseCode: updatedEnrollment.offering.course.code,
        courseTitle: updatedEnrollment.offering.course.title,
      },
    });
  } catch (error) {
    console.error('Error processing enrollment approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
