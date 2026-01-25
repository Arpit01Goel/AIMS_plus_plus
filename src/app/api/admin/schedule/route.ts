import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        let academicSessionId = searchParams.get('academicSessionId');

        // Fetch all academic sessions for the filter
        const sessions = await prisma.academicSession.findMany({
            orderBy: { startDate: 'desc' },
            select: {
                id: true,
                code: true,
                isCurrent: true,
                startDate: true
            }
        });

        if (sessions.length === 0) {
            return NextResponse.json({ offerings: [], sessions: [], currentSessionId: null });
        }

        // Determine which session to use if not specified
        if (!academicSessionId || academicSessionId === '') {
            const currentSession = sessions.find(s => s.isCurrent);
            if (currentSession) {
                academicSessionId = currentSession.id;
            } else {
                academicSessionId = sessions[0].id;
            }
        }

        const offerings = await prisma.courseOffering.findMany({
            where: {
                academicSessionId,
            },
            include: {
                course: {
                    select: {
                        code: true,
                        title: true,
                        department: {
                            select: { code: true }
                        }
                    }
                },
                courseMeetings: {
                    orderBy: {
                        dayOfWeek: 'asc'
                    }
                },
                primaryInstructor: {
                    select: {
                        user: { select: { name: true } }
                    }
                }
            },
            orderBy: {
                course: { code: 'asc' }
            }
        });

        return NextResponse.json({
            offerings,
            sessions,
            currentSessionId: academicSessionId
        });
    } catch (error) {
        console.error('Schedule GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
    }
}
