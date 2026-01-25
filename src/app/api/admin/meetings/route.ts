import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { offeringId, dayOfWeek, startTime, endTime, location } = body;

        if (!offeringId || !dayOfWeek || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const meeting = await prisma.courseMeeting.create({
            data: {
                offeringId,
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime,
                location
            }
        });

        return NextResponse.json(meeting, { status: 201 });
    } catch (error) {
        console.error('Meeting create error:', error);
        return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }
}
