import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/programs - Get all programs
export async function GET() {
    try {
        const programs = await prisma.program.findMany({
            include: {
                department: true,
            },
            orderBy: [
                { level: 'asc' },
                { code: 'asc' },
            ],
        });

        return NextResponse.json(programs);
    } catch (error) {
        console.error('Programs GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
