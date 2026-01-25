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

    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Forbidden - Instructor role required' }, { status: 403 });
    }

    // Get advisor profile
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
      include: {
        department: true,
      },
    });

    if (!instructor || !instructor.isAdvisor) {
      return NextResponse.json({ error: 'Instructor not found or not an advisor' }, { status: 404 });
    }

    // Get all students under this advisor
    const students = await prisma.student.findMany({
      where: {
        advisorId: instructor.id,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        program: {
          select: {
            code: true,
            name: true,
          },
        },
        department: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        entryNumber: 'asc',
      },
    });

    // Format student data
    const studentsWithStats = students.map((student) => {
      return {
        id: student.id,
        orgId: student.entryNumber,
        name: student.user.name || 'N/A',
        email: student.user.email,
        batch: student.batch,
        program: student.program?.name || 'N/A',
        department: student.department?.name || 'N/A',
        phone: student.phone,
        address: student.address,
      };
    });

    return NextResponse.json({
      students: studentsWithStats,
      advisor: {
        id: instructor.id,
        primaryCohort: instructor.primaryCohort,
        department: instructor.department?.name,
      },
    });
  } catch (error) {
    console.error('Error fetching advisor students:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

