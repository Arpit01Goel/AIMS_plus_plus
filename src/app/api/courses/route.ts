import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/courses - List courses (role-aware)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionCode = searchParams.get('session'); // e.g., "2025-II"
    const category = searchParams.get('category');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        student: true,
        instructor: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User:', { email: user.email, role: user.role, instructorId: user.instructor?.id });

    // For instructors: return their courses
    if (user.role === 'INSTRUCTOR' && user.instructor) {
      console.log('Fetching courses for instructor:', user.instructor.id);
      const courses = await prisma.courseOffering.findMany({
        where: {
          instructorId: user.instructor.id,
          ...(sessionCode && {
            academicSession: {
              code: sessionCode,
            },
          }),
        },
        include: {
          course: true,
          academicSession: true,
          enrollments: {
            where: {
              status: 'ENROLLED' as any,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log('Found courses:', courses.length);

      return NextResponse.json({
        courses: courses.map((offering) => ({
          id: offering.id,
          code: offering.course.code,
          title: offering.course.title,
          credits: offering.course.credits,
          category: offering.course.category,
          ltpsc: offering.course.ltpsc,
          students: offering.enrollments.length,
          capacity: offering.capacity,
          slot: offering.slot || 'TBA',
          session: offering.academicSession.code,
          status: offering.status,
        })),
      });
    }

    // For students: return available courses and enrolled courses
    if (user.role === 'STUDENT' && user.student) {
      const studentId = user.student.id;
      const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
      });

      if (!currentSession) {
        return NextResponse.json({ courses: [] });
      }

      const offerings = await prisma.courseOffering.findMany({
        where: {
          academicSessionId: sessionCode
            ? { equals: (await prisma.academicSession.findUnique({ where: { code: sessionCode } }))?.id }
            : currentSession.id,
          status: {
            in: ['ENROLLING', 'RUNNING'],
          },
          ...(category && {
            course: {
              category: category as any,
            },
          }),
        },
        include: {
          course: true,
          academicSession: true,
          primaryInstructor: {
            include: {
              user: true,
            },
          },
          enrollments: {
            where: {
              OR: [
                { status: 'ENROLLED' as any },
                { studentId: studentId },
              ],
            },
          },
        },
      });

      return NextResponse.json({
        courses: offerings.map((offering) => ({
          id: offering.id,
          code: offering.course.code,
          title: offering.course.title,
          credits: offering.course.credits,
          category: offering.course.category,
          ltpsc: offering.course.ltpsc,
          instructor: offering.primaryInstructor?.user.name || 'TBA',
          enrolled: offering.enrollments.filter((e) => e.status === 'ENROLLED').length,
          capacity: offering.capacity,
          slot: offering.slot,
          session: offering.academicSession.code,
          isEnrolled: offering.enrollments.some((e) => e.studentId === studentId),
          enrollmentStatus: offering.enrollments.find((e) => e.studentId === studentId)?.status,
        })),
      });
    }

    return NextResponse.json({ courses: [] });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
