import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/events
 * Fetch academic events for calendar
 * Optional query params: ?session=2025-II&visibility=STUDENT_ONLY
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const sessionCode = searchParams.get('session');
        const visibility = searchParams.get('visibility');

        // Get user role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Build where clause based on filters
        const whereClause: any = {};

        // Filter by session if provided
        if (sessionCode) {
            whereClause.OR = [
                { description: { contains: sessionCode } },
                { title: { contains: sessionCode } },
            ];
        }

        // Filter by visibility based on user role
        if (user.role === 'STUDENT') {
            whereClause.visibility = {
                in: ['STUDENT_ONLY', 'ALL'],
            };
        } else if (user.role === 'INSTRUCTOR') {
            whereClause.visibility = {
                in: ['INSTRUCTOR_ONLY', 'ALL'],
            };
        }
        // Admin sees all

        if (visibility) {
            whereClause.visibility = visibility;
        }

        // Fetch events
        const events = await prisma.academicEvent.findMany({
            where: whereClause,
            orderBy: [
                { startDate: 'asc' },
            ],
        });

        // Format events for frontend
        const formattedEvents = events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            type: event.type,
            visibility: event.visibility,
        }));

        return NextResponse.json({
            events: formattedEvents,
            total: formattedEvents.length,
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/events
 * Create a new academic event (Admin only)
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

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only admins can create events' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, description, startDate, endDate, type, visibility } = body;

        // Validate required fields
        if (!title || !startDate || !endDate || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: title, startDate, endDate, type' },
                { status: 400 }
            );
        }

        // Create event
        const event = await prisma.academicEvent.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                type,
                visibility: visibility || 'ALL',
            },
        });

        return NextResponse.json({
            success: true,
            event: {
                id: event.id,
                title: event.title,
                description: event.description,
                startDate: event.startDate,
                endDate: event.endDate,
                type: event.type,
                visibility: event.visibility,
            },
        });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
