import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CourseCategory } from '@prisma/client';

// GET /api/admin/courses - List all courses (admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const category = searchParams.get('category');

    const courses = await prisma.course.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { title: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          departmentId ? { departmentId } : {},
          category ? { category: category as CourseCategory } : {},
        ],
      },
      include: {
        department: true,
        _count: {
          select: {
            offerings: true,
          },
        },
      },
      orderBy: [
        { code: 'asc' },
      ],
    });

    return NextResponse.json({
      courses: courses.map(course => ({  
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
        ltpsc: course.ltpsc,
        category: course.category,
        department: course.department ? {
          id: course.department.id,
          code: course.department.code,
          name: course.department.name,
        } : null,
        offeringsCount: course._count.offerings,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Admin courses GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create a new course
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { code, title, credits, ltpsc, category, degree, departmentId } = body;

    // Validation
    if (!code || !title || !credits || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: code, title, credits, category' },
        { status: 400 }
      );
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: `Course with code ${code} already exists` },
        { status: 409 }
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        code,
        title,
        credits: parseInt(credits),
        ltpsc: ltpsc || null,
        category: category as CourseCategory,
        departmentId: departmentId || null,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({
      message: 'Course created successfully',
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
        ltpsc: course.ltpsc,
        category: course.category,
        department: course.department ? {
          id: course.department.id,
          code: course.department.code,
          name: course.department.name,
        } : null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin courses POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses - Bulk update courses
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, ...updateData } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(updateData.code && { code: updateData.code }),
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.credits !== undefined && { credits: parseInt(updateData.credits) }),
        ...(updateData.ltpsc !== undefined && { ltpsc: updateData.ltpsc }),
        ...(updateData.category && { category: updateData.category as CourseCategory }),
        ...(updateData.departmentId !== undefined && { departmentId: updateData.departmentId }),
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({
      message: 'Course updated successfully',
      course: {
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits,
        ltpsc: course.ltpsc,
        category: course.category,
        department: course.department ? {
          id: course.department.id,
          code: course.department.code,
          name: course.department.name,
        } : null,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin courses PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses - Delete a course
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    // Check if course has any offerings
    const offeringsCount = await prisma.courseOffering.count({
      where: { courseId },
    });

    if (offeringsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing offerings. Remove offerings first.' },
        { status: 409 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Admin courses DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
