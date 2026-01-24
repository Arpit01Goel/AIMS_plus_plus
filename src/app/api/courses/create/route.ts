import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/courses/create - Create new course offering (instructor only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Only instructors can create course offerings' },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { instructor: true },
    });

    if (!user?.instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      courseId, // ID of existing course to use
      courseCode,
      courseTitle,
      credits,
      ltpsc,
      category,
      degree,
      capacity,
      slot,
      sessionCode,
      instructorIds,
    } = body;

    // Validate required fields
    if (!sessionCode) {
      return NextResponse.json(
        { error: 'Session code is required' },
        { status: 400 }
      );
    }

    let course;

    // If courseId is provided, use existing course
    if (courseId) {
      course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
    } else {
      // Otherwise, validate and create/find new course
      if (!courseCode || !courseTitle || !credits || !category) {
        return NextResponse.json(
          { error: 'Missing required course fields' },
          { status: 400 }
        );
      }

      // Validate category
      const validCategories = ['SC', 'SE', 'GR', 'PC', 'PE', 'HC', 'HE', 'CP', 'CT', 'NN', 'OC'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid course category' },
          { status: 400 }
        );
      }

      // Find or create the course
      course = await prisma.course.findUnique({
        where: { code: courseCode },
      });

      if (!course) {
        course = await prisma.course.create({
          data: {
            code: courseCode,
            title: courseTitle,
            credits: parseInt(credits),
            ltpsc: ltpsc || '0-0-0-0',
            category: category as any,
            degree: degree || null,
            departmentId: user.instructor.departmentId,
          },
        });
      }
    }

    // Find academic session
    const academicSession = await prisma.academicSession.findUnique({
      where: { code: sessionCode },
    });

    if (!academicSession) {
      return NextResponse.json(
        { error: 'Academic session not found' },
        { status: 404 }
      );
    }

    // Create course offering
    const offering = await prisma.courseOffering.create({
      data: {
        courseId: course.id,
        academicSessionId: academicSession.id,
        instructorId: user.instructor.id,
        capacity: capacity ? parseInt(capacity) : 60,
        slot: slot || null,
        status: 'ENROLLING',
      },
      include: {
        course: true,
        academicSession: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Course offering created successfully',
      offering: {
        id: offering.id,
        code: offering.course.code,
        title: offering.course.title,
        session: offering.academicSession.code,
      },
    });
  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create course offering' },
      { status: 500 }
    );
  }
}
