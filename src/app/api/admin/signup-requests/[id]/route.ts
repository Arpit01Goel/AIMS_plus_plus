import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE - Reject/Delete a signup request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if the signup request exists
    const signupRequest = await prisma.signupRequest.findUnique({
      where: { id },
    });

    if (!signupRequest) {
      return NextResponse.json(
        { error: 'Signup request not found' },
        { status: 404 }
      );
    }

    // Delete the signup request
    await prisma.signupRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Signup request rejected successfully',
    });

  } catch (error) {
    console.error('Error rejecting signup request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
