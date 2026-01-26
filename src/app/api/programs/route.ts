import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

// POST /api/programs - Create a new program (admin only)
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
        const { code, name, level, departmentId } = body;

        if (!code || !name) {
            return NextResponse.json(
                { error: 'Program code and name are required' },
                { status: 400 }
            );
        }

        // Check if program code already exists
        const existingProgram = await prisma.program.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (existingProgram) {
            return NextResponse.json(
                { error: 'Program code already exists' },
                { status: 400 }
            );
        }

        // If departmentId is provided, verify it exists
        if (departmentId) {
            const department = await prisma.department.findUnique({
                where: { id: departmentId },
            });

            if (!department) {
                return NextResponse.json(
                    { error: 'Invalid department ID' },
                    { status: 400 }
                );
            }
        }

        const program = await prisma.program.create({
            data: {
                code: code.toUpperCase(),
                name: name.trim(),
                level: level || null,
                departmentId: departmentId || null,
            },
            include: {
                department: true,
            },
        });

        return NextResponse.json(program, { status: 201 });
    } catch (error) {
        console.error('Programs POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
