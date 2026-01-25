import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/admin/sessions - List all academic sessions
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

    const sessions = await prisma.academicSession.findMany({
      orderBy: [
        { startDate: 'desc' },
      ],
      include: {
        _count: {
          select: {
            courseOfferings: true,
          },
        },
      },
    });

    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session.id,
        code: session.code,
        startDate: session.startDate,
        endDate: session.endDate,
        isCurrent: session.isCurrent,
        offeringsCount: session._count.courseOfferings,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Admin sessions GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sessions - Create a new academic session
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
    const { code, startDate, endDate, isCurrent } = body;

    // Validation
    if (!code || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: code, startDate, endDate' },
        { status: 400 }
      );
    }

    // Check if session code already exists
    const existingSession = await prisma.academicSession.findUnique({
      where: { code },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: `Academic session with code ${code} already exists` },
        { status: 409 }
      );
    }

    // If setting as current, unset all other current sessions
    if (isCurrent) {
      await prisma.academicSession.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    // Create session
    const newSession = await prisma.academicSession.create({
      data: {
        code,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent: isCurrent || false,
      },
    });

    return NextResponse.json({
      message: 'Academic session created successfully',
      session: {
        id: newSession.id,
        code: newSession.code,
        startDate: newSession.startDate,
        endDate: newSession.endDate,
        isCurrent: newSession.isCurrent,
        createdAt: newSession.createdAt,
        updatedAt: newSession.updatedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin sessions POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sessions - Update an academic session
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
    const { sessionId, ...updateData } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // If setting as current, unset all other current sessions
    if (updateData.isCurrent) {
      await prisma.academicSession.updateMany({
        where: { 
          isCurrent: true,
          NOT: { id: sessionId }
        },
        data: { isCurrent: false },
      });
    }

    // Update session
    const updatedSession = await prisma.academicSession.update({
      where: { id: sessionId },
      data: {
        ...(updateData.code && { code: updateData.code }),
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        ...(updateData.isCurrent !== undefined && { isCurrent: updateData.isCurrent }),
      },
    });

    return NextResponse.json({
      message: 'Academic session updated successfully',
      session: {
        id: updatedSession.id,
        code: updatedSession.code,
        startDate: updatedSession.startDate,
        endDate: updatedSession.endDate,
        isCurrent: updatedSession.isCurrent,
        updatedAt: updatedSession.updatedAt,
      },
    });
  } catch (error) {
    console.error('Admin sessions PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sessions - Delete an academic session
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Check if session has any offerings
    const offeringsCount = await prisma.courseOffering.count({
      where: { academicSessionId: sessionId },
    });

    if (offeringsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete session with existing course offerings. Remove offerings first.' },
        { status: 409 }
      );
    }

    // Delete session
    await prisma.academicSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      message: 'Academic session deleted successfully',
    });
  } catch (error) {
    console.error('Admin sessions DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
