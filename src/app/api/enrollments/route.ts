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
    const { action, enrollmentId, enrollmentIds, offeringId, enrollmentType } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        instructor: true,
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

      // Fetch the offering with constraints
      const offering = await prisma.courseOffering.findUnique({
        where: { id: offeringId },
        include: {
          course: true,
        },
      });

      if (!offering) {
        return NextResponse.json(
          { error: 'Course offering not found' },
          { status: 404 }
        );
      }

      // Fetch student with program information
      const student = await prisma.student.findUnique({
        where: { id: user.student.id },
        include: {
          program: true,
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student profile not found' },
          { status: 404 }
        );
      }

      // Validate allowed constraint (programCode + batch pairs)
      if (offering.allowed) {
        const restrictions = offering.allowed as Array<{programCode: string; batch: string}>;
        if (restrictions && restrictions.length > 0) {
          const studentBatch = student.batch?.toString();
          const studentProgramCode = student.program?.code;
          
          // Check if student's program+batch combination is in the allowed list
          const isAllowed = restrictions.some(
            (r) => r.programCode === studentProgramCode && r.batch === studentBatch
          );
          
          if (!isAllowed) {
            return NextResponse.json(
              { error: 'Your program and batch combination is not allowed to enroll in this course' },
              { status: 403 }
            );
          }
        }
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

    // Instructor bulk approve/reject
    if ((action === 'bulk_approve' || action === 'bulk_reject') && user.role === 'INSTRUCTOR' && user.instructor) {
      if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
        return NextResponse.json(
          { error: 'enrollmentIds array required' },
          { status: 400 }
        );
      }

      // Fetch all enrollments at once to validate
      const enrollments = await prisma.enrollment.findMany({
        where: {
          id: { in: enrollmentIds },
          offering: {
            instructorId: user.instructor.id,
          },
          status: 'PENDING_INSTRUCTOR_APPROVAL',
        },
        include: {
          offering: true,
        },
      });

      if (enrollments.length !== enrollmentIds.length) {
        return NextResponse.json(
          { error: 'Some enrollments not found or not pending' },
          { status: 404 }
        );
      }

      const newStatus = action === 'bulk_approve' ? 'PENDING_ADVISOR_APPROVAL' : 'REJECTED_BY_INSTRUCTOR';
      const results = { success: 0, failed: 0, errors: [] as string[] };

      // Process each enrollment
      for (const enrollment of enrollments) {
        try {
          // Check capacity if approving
          if (action === 'bulk_approve') {
            const enrolledCount = await prisma.enrollment.count({
              where: {
                offeringId: enrollment.offeringId,
                status: 'ENROLLED',
              },
            });

            if (enrolledCount >= enrollment.offering.capacity) {
              results.failed++;
              results.errors.push(`Course ${enrollment.offering.id} at capacity`);
              continue;
            }
          }

          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
              status: newStatus,
              updatedById: user.id,
            },
          });

          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Failed to process enrollment ${enrollment.id}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: action === 'bulk_approve'
          ? `${results.success} enrollments approved, ${results.failed} failed`
          : `${results.success} enrollments rejected, ${results.failed} failed`,
        results,
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

    // Advisor approve/reject (instructors who are advisors)
    if ((action === 'approve' || action === 'reject') && user.role === 'INSTRUCTOR' && user.instructor?.isAdvisor) {
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
            advisorId: user.instructor.id,
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

    // Admin bulk enroll by pattern
    if (action === 'bulk_enroll_admin' && user.role === 'ADMIN') {
      const { offeringId, pattern } = body;
      if (!offeringId || !pattern) {
        return NextResponse.json({ error: 'offeringId and pattern required' }, { status: 400 });
      }

      // Convert pattern like 2021CS* to Prisma startsWith
      const searchPattern = pattern.replace(/\*/g, '');

      const offering = await prisma.courseOffering.findUnique({
        where: { id: offeringId },
        include: { _count: { select: { enrollments: true } } }
      });

      if (!offering) {
        return NextResponse.json({ error: 'Offering not found' }, { status: 404 });
      }

      // Find students matching pattern
      const students = await prisma.student.findMany({
        where: {
          entryNumber: {
            startsWith: searchPattern,
            mode: 'insensitive'
          },
          // Exclude students already enrolled
          enrollments: {
            none: {
              offeringId: offeringId
            }
          }
        }
      });

      if (students.length === 0) {
        return NextResponse.json({ message: 'No more students found matching this pattern' }, { status: 200 });
      }

      // Check capacity
      const remainingCapacity = offering.capacity - offering._count.enrollments;
      const studentsToEnroll = students.slice(0, remainingCapacity);

      if (studentsToEnroll.length === 0) {
        return NextResponse.json({ error: 'Offering is already at full capacity' }, { status: 400 });
      }

      // Create enrollments
      await prisma.enrollment.createMany({
        data: studentsToEnroll.map(student => ({
          studentId: student.id,
          offeringId: offeringId,
          status: 'ENROLLED', // Admin direct enrollment
          enrollmentType: 'CREDIT',
          createdById: user.id
        })),
        skipDuplicates: true
      });

      return NextResponse.json({
        success: true,
        message: `Successfully enrolled ${studentsToEnroll.length} students.`,
        enrolledCount: studentsToEnroll.length,
        skippedCount: students.length - studentsToEnroll.length
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
              department: true,
              record: true,
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

      // Get all departments for filter options
      const departments = await prisma.department.findMany({
        orderBy: { code: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
        },
      });

      // Get unique years/batches from students with pending enrollments
      const uniqueBatches = await prisma.student.findMany({
        where: {
          enrollments: {
            some: {
              status: 'PENDING_INSTRUCTOR_APPROVAL',
              offering: {
                instructorId: user.instructor.id,
              },
            },
          },
          batch: {
            not: null,
          },
        },
        select: {
          batch: true,
        },
        distinct: ['batch'],
        orderBy: {
          batch: 'desc',
        },
      });

      return NextResponse.json({
        pending: pendingEnrollments.map((e) => ({
          id: e.id,
          student: {
            id: e.student.id,
            name: e.student.user.name,
            entryNumber: e.student.entryNumber,
            program: e.student.program?.code || 'N/A',
            department: e.student.department?.code || 'N/A',
            branch: e.student.department?.name || 'N/A',
            batch: e.student.batch || null,
            cgpa: e.student.record?.cgpa || 0,
          },
          course: {
            code: e.offering.course.code,
            title: e.offering.course.title,
            session: e.offering.academicSession.code,
          },
          enrollmentType: e.enrollmentType,
          createdAt: e.createdAt,
        })),
        filters: {
          departments: departments.map(d => ({
            code: d.code,
            name: d.name,
          })),
          batches: uniqueBatches.map(b => b.batch).filter(Boolean),
        },
      });
    }

    // Advisor: get pending approvals for their advisees (instructors who are advisors)
    if (user.role === 'INSTRUCTOR' && user.instructor?.isAdvisor) {
      const pendingEnrollments = await prisma.enrollment.findMany({
        where: {
          status: 'PENDING_ADVISOR_APPROVAL' as any,
          student: {
            advisorId: user.instructor.id,
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
