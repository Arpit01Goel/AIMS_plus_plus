import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/grades - Get grades (role-aware)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const offeringId = searchParams.get('offeringId');

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

    // Student: get their grades
    if (user.role === 'STUDENT' && user.student) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: user.student.id,
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
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        grades: enrollments.map((e) => ({
          courseCode: e.offering.course.code,
          courseTitle: e.offering.course.title,
          session: e.offering.academicSession.code,
          grade: e.grade || 'N/A',
          credits: e.offering.course.credits,
        })),
      });
    }

    // Instructor: get grades for a specific offering
    if (user.role === 'INSTRUCTOR' && user.instructor) {
      if (!offeringId) {
        return NextResponse.json(
          { error: 'offeringId required for instructor' },
          { status: 400 }
        );
      }

      const offering = await prisma.courseOffering.findFirst({
        where: {
          id: offeringId,
          instructorId: user.instructor.id,
        },
        include: {
          course: true,
        },
      });

      if (!offering) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }

      const enrollments = await prisma.enrollment.findMany({
        where: {
          offeringId,
          status: 'ENROLLED',
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          student: {
            entryNumber: 'asc',
          },
        },
      });

      return NextResponse.json({
        course: {
          code: offering.course.code,
          title: offering.course.title,
        },
        students: enrollments.map((e) => ({
          enrollmentId: e.id,
          studentId: e.student.id,
          entryNumber: e.student.entryNumber,
          name: e.student.user.name,
          grade: e.grade || '',
        })),
      });
    }

    return NextResponse.json({ grades: [] });
  } catch (error) {
    console.error('Grades GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/grades - Update single grade (instructor only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, grade } = body;

    if (!enrollmentId || !grade) {
      return NextResponse.json(
        { error: 'enrollmentId and grade required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instructor: true },
    });

    if (user?.role !== 'INSTRUCTOR' || !user.instructor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify instructor owns this offering
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        offering: {
          instructorId: user.instructor.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        grade: grade as any,
        updatedById: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Grade updated',
    });
  } catch (error) {
    console.error('Grade POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT /api/grades - Bulk update grades (instructor only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { offeringId, grades } = body;

    if (!offeringId || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'offeringId and grades array required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instructor: true },
    });

    if (user?.role !== 'INSTRUCTOR' || !user.instructor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify instructor owns this offering
    const offering = await prisma.courseOffering.findFirst({
      where: {
        id: offeringId,
        instructorId: user.instructor.id,
      },
    });

    if (!offering) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Bulk update
    await Promise.all(
      grades.map((g: { enrollmentId: string; grade: string }) =>
        prisma.enrollment.update({
          where: { id: g.enrollmentId },
          data: {
            grade: g.grade as any,
            updatedById: user.id,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${grades.length} grades`,
    });
  } catch (error) {
    console.error('Grades PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/grades - Submit grades for verification (instructor only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { offeringId, grades } = body;

    if (!offeringId || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'offeringId and grades array required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { instructor: true },
    });

    if (user?.role !== 'INSTRUCTOR' || !user.instructor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify instructor owns this offering
    const offering = await prisma.courseOffering.findFirst({
      where: {
        id: offeringId,
        instructorId: user.instructor.id,
      },
      include: {
        course: true,
        academicSession: true,
      },
    });

    if (!offering) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Validate all grades are provided
    const enrollments = await prisma.enrollment.findMany({
      where: {
        offeringId,
        status: 'ENROLLED',
      },
    });

    const gradeMap = new Map(grades.map((g: { enrollmentId: string; grade: string }) => [g.enrollmentId, g.grade]));
    
    // Check if all enrolled students have grades
    const missingGrades = enrollments.filter((e) => !gradeMap.has(e.id) || !gradeMap.get(e.id));
    
    if (missingGrades.length > 0) {
      return NextResponse.json(
        { error: `Missing grades for ${missingGrades.length} student(s). All students must have grades before submission.` },
        { status: 400 }
      );
    }

    // Update all grades in a transaction
    await prisma.$transaction(
      grades.map((g: { enrollmentId: string; grade: string }) =>
        prisma.enrollment.update({
          where: { id: g.enrollmentId },
          data: {
            grade: g.grade as any,
            updatedById: user.id,
          },
        })
      )
    );

    // Log the submission (you can add a GradeSubmission model if needed for audit trail)
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: `Successfully submitted grades for ${grades.length} student(s) in ${offering.course.code}`,
      course: {
        code: offering.course.code,
        title: offering.course.title,
        session: offering.academicSession.code,
      },
    });
  } catch (error) {
    console.error('Grades PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
