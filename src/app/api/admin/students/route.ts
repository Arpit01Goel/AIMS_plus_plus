import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/students
 * Create a new student with advisor assignment (admin only)
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
        const {
            name,
            email,
            password,
            entryNumber,
            batch,
            phone,
            address,
            departmentId,
            programId,
            advisorId,
        } = body;

        // Validation
        if (!name || !email || !password || !entryNumber) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, password, entryNumber' },
                { status: 400 }
            );
        }

        // Validate email domain
        const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || 'iitrpr.ac.in';
        if (!email.endsWith(`@${allowedDomain}`)) {
            return NextResponse.json(
                { error: `Email must end with @${allowedDomain}` },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Check if entry number already exists
        const existingStudent = await prisma.student.findUnique({
            where: { entryNumber },
        });

        if (existingStudent) {
            return NextResponse.json(
                { error: 'Student with this entry number already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and student in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    role: 'STUDENT',
                },
            });

            // Create student profile
            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    entryNumber,
                    batch: batch ? parseInt(batch) : null,
                    phone: phone || null,
                    address: address || null,
                    departmentId: departmentId || null,
                    programId: programId || null,
                    advisorId: advisorId || null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                        },
                    },
                    department: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                    program: {
                        select: {
                            code: true,
                            name: true,
                        },
                    },
                    advisor: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });

            return student;
        });

        return NextResponse.json(
            {
                message: 'Student created successfully',
                student: result,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Student POST error:', error);
        return NextResponse.json(
            { error: 'Failed to create student' },
            { status: 500 }
        );
    }
}
