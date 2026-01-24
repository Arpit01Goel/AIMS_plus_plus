import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/instructors/bulk-advisor-status
 * Bulk update advisor status for multiple instructors
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { instructors } = body;

        if (!instructors || !Array.isArray(instructors) || instructors.length === 0) {
            return NextResponse.json(
                { error: 'Invalid request - instructors array is required' },
                { status: 400 }
            );
        }

        const results = {
            total: instructors.length,
            success: 0,
            failed: 0,
            errors: [] as any[],
        };

        // Process each instructor
        for (const item of instructors) {
            try {
                const { email, isAdvisor, primaryCohort, advisorNotes } = item;

                if (!email) {
                    throw new Error('Email is required');
                }

                if (typeof isAdvisor !== 'boolean') {
                    throw new Error('isAdvisor must be a boolean value');
                }

                // Find instructor by email
                const user = await prisma.user.findUnique({
                    where: { email: email.toLowerCase() },
                    include: {
                        instructor: true,
                    },
                });

                if (!user) {
                    throw new Error(`User with email ${email} not found`);
                }

                if (!user.instructor) {
                    throw new Error(`User ${email} is not an instructor`);
                }

                // Update advisor status
                await prisma.instructor.update({
                    where: { id: user.instructor.id },
                    data: {
                        isAdvisor,
                        primaryCohort: isAdvisor ? (primaryCohort || null) : null,
                        advisorNotes: isAdvisor ? (advisorNotes || null) : null,
                    },
                });

                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    email: item.email || 'N/A',
                    error: error.message,
                });
            }
        }

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Bulk advisor status update error:', error);
        return NextResponse.json(
            { error: 'Failed to update advisor status in bulk' },
            { status: 500 }
        );
    }
}
