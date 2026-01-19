import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/enrollments - Create enrollment (student) or approve/reject (instructor)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, enrollmentId, offeringId, enrollmentType } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        instructor: true,
        advisor: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Student enrollment request
    if (action === 'enroll' && user.role === 'STUDENT' && user.student) {
      if (!offeringId) {
        return NextResponse.json(
          { error: 'offeringId required' },
          { status: 400 }
        );
      }

      // Check if already enrolled
      const existing = await prisma.enrollment.findUnique({
        where: {
          studentId_offeringId: {
            studentId: user.student.id,
            offeringId,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Already enrolled or pending' },
          { status: 400 }
        );
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: user.student.id,
          offeringId,
          status: 'PENDING_INSTRUCTOR_APPROVAL',
          enrollmentType: enrollmentType || 'CREDIT',
          createdById: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment request submitted',
        enrollmentId: enrollment.id,
      });
    }

    // Instructor approve/reject
    if ((action === 'approve' || action === 'reject') && user.role === 'INSTRUCTOR' && user.instructor) {
      if (!enrollmentId) {
        return NextResponse.json(
          { error: 'enrollmentId required' },
          { status: 400 }
        );
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          offering: {
            instructorId: user.instructor.id,
          },
          status: 'PENDING_INSTRUCTOR_APPROVAL',
        },
        include: {
          offering: true,
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: 'Enrollment not found or not pending' },
          { status: 404 }
        );
      }

      // Check capacity if approving
      if (action === 'approve') {
        const enrolledCount = await prisma.enrollment.count({
          where: {
            offeringId: enrollment.offeringId,
            status: 'ENROLLED',
          },
        });

        if (enrolledCount >= enrollment.offering.capacity) {
          return NextResponse.json(
            { error: 'Course is at full capacity' },
            { status: 400 }
          );
        }
      }

      // When instructor approves, it goes to advisor for approval
      const newStatus = action === 'approve' ? 'PENDING_ADVISOR_APPROVAL' : 'REJECTED_BY_INSTRUCTOR';

      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: newStatus,
          updatedById: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: action === 'approve' 
          ? 'Enrollment approved and sent to advisor for final approval' 
          : 'Enrollment rejected',
      });
    }

    // Advisor approve/reject
    if ((action === 'approve' || action === 'reject') && user.role === 'ADVISOR' && user.advisor) {
      if (!enrollmentId) {
        return NextResponse.json(
          { error: 'enrollmentId required' },
          { status: 400 }
        );
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          status: 'PENDING_ADVISOR_APPROVAL',
          student: {
            advisorId: user.advisor.id,
          },
        },
        include: {
          offering: true,
          student: true,
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: 'Enrollment not found, not pending advisor approval, or not your advisee' },
          { status: 404 }
        );
      }

      // Final check on capacity if approving
      if (action === 'approve') {
        const enrolledCount = await prisma.enrollment.count({
          where: {
            offeringId: enrollment.offeringId,
            status: 'ENROLLED',
          },
        });

        if (enrolledCount >= enrollment.offering.capacity) {
          return NextResponse.json(
            { error: 'Course is at full capacity' },
            { status: 400 }
          );
        }
      }

      // Advisor final approval makes student ENROLLED, rejection rejects the enrollment
      const newStatus = action === 'approve' ? 'ENROLLED' : 'REJECTED_BY_ADVISOR';

      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: newStatus,
          updatedById: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: action === 'approve' 
          ? 'Student enrollment finalized successfully' 
          : 'Enrollment rejected',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or insufficient permissions' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Enrollment API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/enrollments - Get enrollments (role-aware)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        instructor: true,
        advisor: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Student: get their enrollments
    if (user.role === 'STUDENT' && user.student) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: user.student.id,
        },
        include: {
          offering: {
            include: {
              course: true,
              academicSession: true,
              primaryInstructor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        enrollments: enrollments.map((e) => ({
          id: e.id,
          code: e.offering.course.code,
          title: e.offering.course.title,
          instructor: e.offering.primaryInstructor?.user.name || 'TBA',
          status: e.status,
          grade: e.grade,
          session: e.offering.academicSession.code,
          enrollmentType: e.enrollmentType,
        })),
      });
    }

    // Instructor: get pending approvals
    if (user.role === 'INSTRUCTOR' && user.instructor) {
      const pendingEnrollments = await prisma.enrollment.findMany({
        where: {
          status: 'PENDING_INSTRUCTOR_APPROVAL' as any,
          offering: {
            instructorId: user.instructor.id,
          },
        },
        include: {
          student: {
            include: {
              user: true,
              program: true,
            },
          },
          offering: {
            include: {
              course: true,
              academicSession: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        pending: pendingEnrollments.map((e) => ({
          id: e.id,
          student: {
            id: e.student.id,
            name: e.student.user.name,
            entryNumber: e.student.entryNumber,
            program: e.student.program?.code || 'N/A',
          },
          course: {
            code: e.offering.course.code,
            title: e.offering.course.title,
            session: e.offering.academicSession.code,
          },
          enrollmentType: e.enrollmentType,
          createdAt: e.createdAt,
        })),
      });
    }

    // Advisor: get pending approvals for their advisees
    if (user.role === 'ADVISOR' && user.advisor) {
      const pendingEnrollments = await prisma.enrollment.findMany({
        where: {
          status: 'PENDING_ADVISOR_APPROVAL' as any,
          student: {
            advisorId: user.advisor.id,
          },
        },
        include: {
          student: {
            include: {
              user: true,
              program: true,
            },
          },
          offering: {
            include: {
              course: true,
              academicSession: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        pending: pendingEnrollments.map((e) => ({
          id: e.id,
          student: {
            id: e.student.id,
            name: e.student.user.name,
            entryNumber: e.student.entryNumber,
            program: e.student.program?.code || 'N/A',
          },
          course: {
            code: e.offering.course.code,
            title: e.offering.course.title,
            session: e.offering.academicSession.code,
          },
          enrollmentType: e.enrollmentType,
          createdAt: e.createdAt,
        })),
      });
    }

    return NextResponse.json({ enrollments: [] });
  } catch (error) {
    console.error('Enrollments GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/enrollments - Update enrollment status (drop course, etc.)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, status } = body;

    if (!enrollmentId || !status) {
      return NextResponse.json(
        { error: 'enrollmentId and status required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { student: true },
    });

    if (user?.role === 'STUDENT' && user.student) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          studentId: user.student.id,
        },
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
      }

      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: status as any,
          updatedById: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment updated',
      });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } catch (error) {
    console.error('Enrollment PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
