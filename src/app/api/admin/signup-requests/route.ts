import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch all signup requests
export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and is an admin
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { role: true },
        });

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        // Get query parameters for filtering
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';

        // Fetch signup requests
        const signupRequests = await prisma.signupRequest.findMany({
            where: {
                status: status.toUpperCase(),
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            requests: signupRequests,
            count: signupRequests.length,
        });

    } catch (error) {
        console.error('Error in GET signup-requests API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Approve or reject signup request
export async function PUT(request: NextRequest) {
    try {
        // Check if user is authenticated and is an admin
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true, role: true },
        });

        if (!adminUser || adminUser.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const { requestId, action, rejectionReason } = await request.json();

        // Validate inputs
        if (!requestId || !action) {
            return NextResponse.json(
                { success: false, message: 'Request ID and action are required' },
                { status: 400 }
            );
        }

        if (!['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
            return NextResponse.json(
                { success: false, message: 'Invalid action. Use APPROVE or REJECT' },
                { status: 400 }
            );
        }

        if (action.toUpperCase() === 'REJECT' && !rejectionReason) {
            return NextResponse.json(
                { success: false, message: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        // Fetch the signup request
        const signupRequest = await prisma.signupRequest.findUnique({
            where: { id: requestId },
        });

        if (!signupRequest) {
            return NextResponse.json(
                { success: false, message: 'Signup request not found' },
                { status: 404 }
            );
        }

        if (signupRequest.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, message: 'This request has already been processed' },
                { status: 409 }
            );
        }

        if (action.toUpperCase() === 'APPROVE') {
            // Update the signup request
            const updatedRequest = await prisma.signupRequest.update({
                where: { id: requestId },
                data: {
                    status: 'APPROVED',
                    processedAt: new Date(),
                    processedBy: adminUser.id,
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Signup request approved successfully',
                request: updatedRequest,
            });

        } else {
            // Reject the request
            const updatedRequest = await prisma.signupRequest.update({
                where: { id: requestId },
                data: {
                    status: 'REJECTED',
                    rejectionReason,
                    processedAt: new Date(),
                    processedBy: adminUser.id,
                },
            });

            return NextResponse.json({
                success: true,
                message: 'Signup request rejected',
                request: updatedRequest,
            });
        }

    } catch (error) {
        console.error('Error in PUT signup-requests API:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
