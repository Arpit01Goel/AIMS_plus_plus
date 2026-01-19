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

    if (session.user.role !== 'ADVISOR') {
      return NextResponse.json({ error: 'Forbidden - Advisor role required' }, { status: 403 });
    }

    // Get advisor profile with full details
    const advisor = await prisma.advisor.findUnique({
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
        program: {
          select: {
            name: true,
            code: true,
          },
        },
        students: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!advisor) {
      return NextResponse.json({ error: 'Advisor profile not found' }, { status: 404 });
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
        name: advisor.user.name || 'N/A',
        email: advisor.user.email,
        department: advisor.department?.name || 'N/A',
        departmentCode: advisor.department?.code || 'N/A',
        program: advisor.program?.name || 'N/A',
        primaryCohort: advisor.primaryCohort,
        notes: advisor.notes,
        totalStudents: advisor.students.length,
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
