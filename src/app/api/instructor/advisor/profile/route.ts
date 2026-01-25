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

    // Get advisor profile with full details
    const instructor = await prisma.instructor.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            name: true,
            code: true,
          },
        },
        advisees: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!instructor || !instructor.isAdvisor) {
      return NextResponse.json({ error: 'Instructor not found or not an advisor' }, { status: 404 });
    }

    // Get activity statistics
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const approvedThisMonth = await prisma.enrollment.count({
      where: {
        updatedById: session.user.id,
        status: 'ENROLLED',
        updatedAt: { gte: thisMonthStart },
      },
    });

    const rejectedThisMonth = await prisma.enrollment.count({
      where: {
        updatedById: session.user.id,
        status: 'REJECTED_BY_ADVISOR',
        updatedAt: { gte: thisMonthStart },
      },
    });

    const approvedLastMonth = await prisma.enrollment.count({
      where: {
        updatedById: session.user.id,
        status: 'ENROLLED',
        updatedAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
    });

    const rejectedLastMonth = await prisma.enrollment.count({
      where: {
        updatedById: session.user.id,
        status: 'REJECTED_BY_ADVISOR',
        updatedAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
    });

    return NextResponse.json({
      profile: {
        name: instructor.user.name || 'N/A',
        email: instructor.user.email,
        department: instructor.department?.name || 'N/A',
        departmentCode: instructor.department?.code || 'N/A',
        primaryCohort: instructor.primaryCohort,
        notes: instructor.advisorNotes,
        totalStudents: instructor.advisees.length,
        isAdvisor: instructor.isAdvisor,
      },
      activityStats: {
        thisMonth: {
          approvals: approvedThisMonth,
          rejections: rejectedThisMonth,
        },
        lastMonth: {
          approvals: approvedLastMonth,
          rejections: rejectedLastMonth,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching advisor profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

