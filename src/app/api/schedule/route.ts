import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/schedule - Get weekly schedule (role-aware)
// Note: Full schedule tracking needs to be implemented in schema
export async function GET(request: NextRequest) {
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

    // Student schedule - get enrolled courses with slot info
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
              primaryInstructor: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      const schedule = enrollments.map((e) => ({
        courseCode: e.offering.course.code,
        courseTitle: e.offering.course.title,
        instructor: e.offering.primaryInstructor?.user.name || 'TBA',
        slot: e.offering.slot || 'TBA',
      }));

      return NextResponse.json({ schedule });
    }

    // Instructor schedule - get teaching courses with slot info
    if (user.role === 'INSTRUCTOR' && user.instructor) {
      const offerings = await prisma.courseOffering.findMany({
        where: {
          instructorId: user.instructor.id,
          status: {
            in: ['ENROLLING', 'RUNNING'],
          },
        },
        include: {
          course: true,
          _count: {
            select: {
              enrollments: {
                where: {
                  status: 'ENROLLED',
                },
              },
            },
          },
        },
      });

      const schedule = offerings.map((o) => ({
        courseCode: o.course.code,
        courseTitle: o.course.title,
        slot: o.slot || 'TBA',
        enrolledCount: o._count.enrollments,
      }));

      return NextResponse.json({ schedule });
    }

    return NextResponse.json({ schedule: [] });
  } catch (error) {
    console.error('Schedule GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
