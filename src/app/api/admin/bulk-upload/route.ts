import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * Helper function to find department by code or name (case-insensitive)
 */
async function findDepartmentId(departmentInput: string | null | undefined): Promise<string | null> {
    if (!departmentInput || departmentInput.trim() === '') {
        return null;
    }

    const input = departmentInput.trim();

    // Try to find by code first (case-insensitive)
    const byCode = await prisma.department.findFirst({
        where: {
            code: {
                equals: input,
                mode: 'insensitive',
            },
        },
    });

    if (byCode) {
        return byCode.id;
    }

    // Try to find by name (case-insensitive, partial match)
    const byName = await prisma.department.findFirst({
        where: {
            name: {
                contains: input,
                mode: 'insensitive',
            },
        },
    });

    if (byName) {
        return byName.id;
    }

    // If not found, throw error with helpful message
    throw new Error(`Department "${departmentInput}" not found. Use department code (e.g., CSE, EE, ME) or full name.`);
}

/**
 * Helper function to find program by code or name (case-insensitive)
 */
async function findProgramId(programInput: string | null | undefined): Promise<string | null> {
    if (!programInput || programInput.trim() === '') {
        return null;
    }

    const input = programInput.trim();

    // Try to find by code first (case-insensitive)
    const byCode = await prisma.program.findFirst({
        where: {
            code: {
                equals: input,
                mode: 'insensitive',
            },
        },
    });

    if (byCode) {
        return byCode.id;
    }

    // Try to find by name (case-insensitive, partial match)
    const byName = await prisma.program.findFirst({
        where: {
            name: {
                contains: input,
                mode: 'insensitive',
            },
        },
    });

    if (byName) {
        return byName.id;
    }

    // If not found, throw error with helpful message
    throw new Error(`Program "${programInput}" not found. Use program code (e.g., BTECH-CSE) or full name.`);
}

/**
 * Helper function to find advisor by email (preferred) or name
 * Email is the recommended identifier to avoid name clashes
 */
async function findAdvisorId(advisorInput: string | null | undefined, isRequired: boolean = false): Promise<string | null> {
    if (!advisorInput || advisorInput.trim() === '') {
        if (isRequired) {
            throw new Error('Advisor is required for students. Please provide advisor email (recommended) or name.');
        }
        return null;
    }

    const input = advisorInput.trim();

    // Try to find user by email first (RECOMMENDED - more unique)
    const userByEmail = await prisma.user.findFirst({
        where: {
            email: {
                equals: input,
                mode: 'insensitive',
            },
            role: 'INSTRUCTOR',
        },
        include: {
            instructor: true,
        },
    });

    if (userByEmail?.instructor) {
        if (!userByEmail.instructor.isAdvisor) {
            throw new Error(`Instructor "${input}" exists but is not marked as an advisor. Please contact admin to update their advisor status.`);
        }
        return userByEmail.instructor.id;
    }

    // Try to find by name (less reliable due to potential duplicates)
    const usersByName = await prisma.user.findMany({
        where: {
            name: {
                contains: input,
                mode: 'insensitive',
            },
            role: 'INSTRUCTOR',
        },
        include: {
            instructor: true,
        },
    });

    const advisorsByName = usersByName.filter(u => u.instructor?.isAdvisor);

    if (advisorsByName.length === 0) {
        throw new Error(`Advisor "${advisorInput}" not found. Please use the advisor's email address (e.g., advisor@iitrpr.ac.in) to avoid ambiguity.`);
    }

    if (advisorsByName.length > 1) {
        const emails = advisorsByName.map(u => u.email).join(', ');
        throw new Error(`Multiple advisors found matching "${advisorInput}". Please use email instead. Found: ${emails}`);
    }

    return advisorsByName[0].instructor!.id;
}

/**
 * POST /api/admin/bulk-upload
 * Bulk upload users from CSV (admin only)
 * Accepts human-readable department/program names instead of IDs
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
        const { users } = body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return NextResponse.json(
                { error: 'Invalid request - users array is required' },
                { status: 400 }
            );
        }

        const results = {
            total: users.length,
            created: 0,
            failed: 0,
            errors: [] as any[],
        };

        // Process users in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);

            await Promise.allSettled(
                batch.map(async (userData: any, index: number) => {
                    try {
                        const {
                            name,
                            email,
                            password,
                            role,
                            entryNumber,
                            batch,
                            phone,
                            address,
                            department,
                            departmentId, // Legacy support
                            program,
                            programId, // Legacy support
                            advisor,
                            advisorId, // Legacy support
                            title,
                            officialEmail,
                        } = userData;

                        // Validate required fields
                        if (!name || !email || !password || !role) {
                            throw new Error(`Row ${i + index + 1}: Missing required fields`);
                        }

                        // Check if user already exists
                        const existingUser = await prisma.user.findUnique({
                            where: { email },
                        });

                        if (existingUser) {
                            throw new Error(`Row ${i + index + 1}: User with email ${email} already exists`);
                        }

                        // Resolve department, program, and advisor to IDs
                        // Support both new human-readable names and legacy IDs
                        const resolvedDepartmentId = await findDepartmentId(department || departmentId);
                        const resolvedProgramId = await findProgramId(program || programId);
                        // Advisor is mandatory for students, optional for others
                        const isStudent = role === 'STUDENT';
                        const resolvedAdvisorId = await findAdvisorId(advisor || advisorId, isStudent);

                        // Hash password
                        const passwordHash = await bcrypt.hash(password, 10);

                        // Create user based on role
                        if (role === 'STUDENT') {
                            if (!entryNumber) {
                                throw new Error(`Row ${i + index + 1}: Entry number required for students`);
                            }

                            // Check if entry number exists
                            const existingStudent = await prisma.student.findUnique({
                                where: { entryNumber },
                            });

                            if (existingStudent) {
                                throw new Error(`Row ${i + index + 1}: Student with entry number ${entryNumber} already exists`);
                            }

                            await prisma.$transaction(async (tx) => {
                                const user = await tx.user.create({
                                    data: {
                                        email,
                                        passwordHash,
                                        name,
                                        role: 'STUDENT',
                                    },
                                });

                                await tx.student.create({
                                    data: {
                                        userId: user.id,
                                        entryNumber,
                                        batch: batch ? parseInt(batch) : null,
                                        phone: phone || null,
                                        address: address || null,
                                        departmentId: resolvedDepartmentId,
                                        programId: resolvedProgramId,
                                        advisorId: resolvedAdvisorId,
                                    },
                                });
                            });

                            results.created++;
                        } else if (role === 'INSTRUCTOR') {
                            await prisma.$transaction(async (tx) => {
                                const user = await tx.user.create({
                                    data: {
                                        email,
                                        passwordHash,
                                        name,
                                        role: 'INSTRUCTOR',
                                    },
                                });

                                await tx.instructor.create({
                                    data: {
                                        userId: user.id,
                                        title: title || null,
                                        officialEmail: officialEmail || email,
                                        departmentId: resolvedDepartmentId,
                                    },
                                });
                            });

                            results.created++;
                        } else if (role === 'ADVISOR') {
                            // ADVISOR role is now merged into INSTRUCTOR with isAdvisor=true
                            // Convert ADVISOR to INSTRUCTOR automatically
                            await prisma.$transaction(async (tx) => {
                                const user = await tx.user.create({
                                    data: {
                                        email,
                                        passwordHash,
                                        name,
                                        role: 'INSTRUCTOR', // Changed from ADVISOR
                                    },
                                });

                                await tx.instructor.create({
                                    data: {
                                        userId: user.id,
                                        departmentId: resolvedDepartmentId,
                                        isAdvisor: true, // Mark as advisor
                                        primaryCohort: batch ? parseInt(batch) : null,
                                        advisorNotes: null,
                                        title: title || null,
                                        officialEmail: officialEmail || email,
                                    },
                                });
                            });

                            results.created++;
                        } else {
                            throw new Error(`Row ${i + index + 1}: Invalid role ${role}`);
                        }
                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({
                            row: i + index + 1,
                            email: userData.email,
                            error: error.message,
                        });
                    }
                })
            );
        }

        return NextResponse.json(
            {
                message: 'Bulk upload completed',
                results,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process bulk upload' },
            { status: 500 }
        );
    }
}
