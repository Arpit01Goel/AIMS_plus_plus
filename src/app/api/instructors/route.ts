import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/instructors - List all instructors
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Fetch instructors with optional search filter
    const instructors = await prisma.instructor.findMany({
      where: search
        ? {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
      take: 20, // Limit results
    });

    return NextResponse.json({
      instructors: instructors.map((instructor) => ({
        id: instructor.id,
        userId: instructor.userId,
        name: instructor.user.name || instructor.user.email,
        email: instructor.user.email,
        title: instructor.title,
        department: instructor.department?.name,
      })),
    });
  } catch (error) {
    console.error('Instructors API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    );
  }
}
