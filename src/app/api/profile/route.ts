import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        student: {
          include: {
            program: true,
            department: true,
          },
        },
        instructor: {
          include: {
            department: true,
            courseOfferings: {
              include: {
                course: true,
                academicSession: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        advisor: {
          include: {
            department: true,
            program: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build role-specific profile
    let profile: any = {
      name: user.name || 'N/A',
      email: user.email,
      role: user.role,
    };

    if (user.role === 'STUDENT' && user.student) {
      profile = {
        ...profile,
        entryNumber: user.student.entryNumber,
        batch: user.student.batch,
        program: user.student.program?.name || 'N/A',
        programCode: user.student.program?.code || 'N/A',
        department: user.student.department?.name || 'N/A',
        phone: user.student.phone || 'N/A',
        address: user.student.address || 'N/A',
      };
    } else if (user.role === 'INSTRUCTOR' && user.instructor) {
      const coursesTaught = user.instructor.courseOfferings.map((offering) => ({
        code: offering.course.code,
        title: offering.course.title,
        session: offering.academicSession.code,
        credits: offering.course.credits,
      }));

      const currentSession = user.instructor.courseOfferings.filter(
        (o: any) => o.status === 'RUNNING' || o.status === 'ENROLLING'
      );

      const allEnrollments = await prisma.enrollment.findMany({
        where: {
          offering: {
            instructorId: user.instructor.id,
          },
          status: 'ENROLLED' as any,
        },
      });

      profile = {
        ...profile,
        designation: user.instructor.title || 'Instructor',
        department: user.instructor.department?.name || 'N/A',
        departmentCode: user.instructor.department?.code || 'N/A',
        phone: 'N/A',
        office: 'N/A',
        coursesTaught,
        stats: {
          coursesThisSemester: currentSession.length,
          totalStudents: allEnrollments.length,
          yearsOfExperience: 0,
          publications: 0,
        },
      };
    } else if (user.role === 'ADVISOR' && user.advisor) {
      profile = {
        ...profile,
        department: user.advisor.department?.name || 'N/A',
        program: user.advisor.program?.name || 'N/A',
        primaryCohort: user.advisor.primaryCohort,
        notes: user.advisor.notes,
      };
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, title } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { student: true, instructor: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Update role-specific fields
    if (user.role === 'STUDENT' && user.student) {
      await prisma.student.update({
        where: { id: user.student.id },
        data: {
          ...(phone && { phone }),
          ...(address && { address }),
        },
      });
    } else if (user.role === 'INSTRUCTOR' && user.instructor) {
      await prisma.instructor.update({
        where: { id: user.instructor.id },
        data: {
          ...(title && { title }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
