import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/attendance - Get attendance records (role-aware)
// Note: Attendance tracking needs to be implemented in schema
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

    // Student: get their attendance percentage from enrollments
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
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        attendance: enrollments.map((e) => ({
          courseCode: e.offering.course.code,
          courseTitle: e.offering.course.title,
          attendancePercentage: e.attendancePercentage || 0,
        })),
      });
    }

    // Instructor: get attendance for enrolled students in a course
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
          attendancePercentage: e.attendancePercentage || 0,
        })),
      });
    }

    return NextResponse.json({ attendance: [] });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/attendance - Update attendance percentage (instructor only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, attendancePercentage } = body;

    if (!enrollmentId || attendancePercentage === undefined) {
      return NextResponse.json(
        { error: 'enrollmentId and attendancePercentage required' },
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
        attendancePercentage,
        updatedById: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance updated',
    });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
