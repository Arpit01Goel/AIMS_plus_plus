import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CourseCategory } from '@prisma/client';

// GET /api/admin/courses/[id] - Get single course details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        offerings: {
          include: {
            academicSession: true,
            primaryInstructor: {
              include: {
                user: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
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
        offerings: course.offerings.map(offering => ({
          id: offering.id,
          session: offering.academicSession.code,
          instructor: offering.primaryInstructor?.user.name || 'TBA',
          capacity: offering.capacity,
          slot: offering.slot,
          status: offering.status,
          enrollments: offering._count.enrollments,
        })),
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin course GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update a specific course
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // If code is being changed, check for conflicts
    if (code && code !== existingCourse.code) {
      const codeConflict = await prisma.course.findUnique({
        where: { code },
      });

      if (codeConflict) {
        return NextResponse.json(
          { error: `Course with code ${code} already exists` },
          { status: 409 }
        );
      }
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(title && { title }),
        ...(credits !== undefined && { credits: parseInt(credits) }),
        ...(ltpsc !== undefined && { ltpsc }),
        ...(category && { category: category as CourseCategory }),
        ...(departmentId !== undefined && { departmentId }),
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
    console.error('Admin course PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete a specific course
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            offerings: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course has any offerings
    if (course._count.offerings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing offerings. Remove offerings first.' },
        { status: 409 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Admin course DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
