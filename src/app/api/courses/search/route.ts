import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/courses/search - Search for existing courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    // Search courses by code or title
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            code: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        { code: 'asc' },
      ],
      take: 20, // Limit results
    });

    return NextResponse.json({
      courses: courses.map(course => ({
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
        ltpsc: course.ltpsc,
        category: course.category,
        degree: course.degree,
        department: course.department ? {
          id: course.department.id,
          code: course.department.code,
          name: course.department.name,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Course search error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
