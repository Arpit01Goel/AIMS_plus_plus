import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instructor: true },
    });

    // Get course offering with students
    const offering = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: true,
        academicSession: true,
        enrollments: {
          where: {
            status: { in: ['ENROLLED', 'PENDING_INSTRUCTOR_APPROVAL'] as any },
          },
          include: {
            student: {
              include: {
                user: true,
                program: true,
              },
            },
          },
          orderBy: {
            student: {
              entryNumber: 'asc',
            },
          },
        },
      },
    });

    if (!offering) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check authorization for instructors
    if (user?.role === 'INSTRUCTOR' && user.instructor) {
      if (offering.instructorId !== user.instructor.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const courseInfo = {
      code: offering.course.code,
      title: offering.course.title,
      session: offering.academicSession.code,
      capacity: offering.capacity,
      enrolled: offering.enrollments.filter((e) => e.status === 'ENROLLED').length,
    };

    const students = offering.enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      entryNumber: enrollment.student.entryNumber,
      name: enrollment.student.user.name || 'N/A',
      email: enrollment.student.user.email,
      program: enrollment.student.program?.code || 'N/A',
      enrollmentType: enrollment.enrollmentType,
      status: enrollment.status,
      grade: enrollment.grade,
      attendance: enrollment.attendancePercentage || 0,
    }));

    return NextResponse.json({
      course: courseInfo,
      students,
    });
  } catch (error) {
    console.error('Course students API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course students' },
      { status: 500 }
    );
  }
}
