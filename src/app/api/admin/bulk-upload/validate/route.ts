import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
 * POST /api/admin/bulk-upload/validate
 * Validate CSV data without actually creating users
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
            valid: 0,
            invalid: 0,
            errors: [] as any[],
            validRows: [] as any[],
        };

        // Pre-fetch all existing users and students to avoid N+1 queries
        const allEmails = users.map(u => u.email).filter(Boolean);
        const allEntryNumbers = users.filter(u => u.role === 'STUDENT' && u.entryNumber).map(u => u.entryNumber);
        
        const [existingUsers, existingStudents] = await Promise.all([
            prisma.user.findMany({
                where: { email: { in: allEmails } },
                select: { email: true },
            }),
            prisma.student.findMany({
                where: { entryNumber: { in: allEntryNumbers } },
                select: { entryNumber: true },
            }),
        ]);

        const existingEmailSet = new Set(existingUsers.map(u => u.email.toLowerCase()));
        const existingEntryNumberSet = new Set(existingStudents.map(s => s.entryNumber));

        // Validate each user
        for (let i = 0; i < users.length; i++) {
            const userData = users[i];
            const rowNumber = i + 1;

            try {
                const {
                    name,
                    email,
                    password,
                    role,
                    entryNumber,
                    batch,
                    department,
                    departmentId,
                    program,
                    programId,
                    advisor,
                    advisorId,
                } = userData;

                // Validate required fields
                if (!name || !email || !password || !role) {
                    throw new Error('Missing required fields (name, email, password, role)');
                }

                // Validate role
                if (!['STUDENT', 'INSTRUCTOR', 'ADVISOR', 'ADMIN'].includes(role)) {
                    throw new Error(`Invalid role "${role}". Must be STUDENT, INSTRUCTOR, ADVISOR, or ADMIN`);
                }

                // Check if user already exists
                if (existingEmailSet.has(email.toLowerCase())) {
                    throw new Error(`User with email ${email} already exists`);
                }

                // Role-specific validation
                if (role === 'STUDENT') {
                    if (!entryNumber) {
                        throw new Error('Entry number required for students');
                    }

                    // Check if entry number exists
                    if (existingEntryNumberSet.has(entryNumber)) {
                        throw new Error(`Student with entry number ${entryNumber} already exists`);
                    }
                }

                // Validate department, program, advisor (but don't fail if optional)
                try {
                    await findDepartmentId(department || departmentId);
                } catch (error: any) {
                    if (department || departmentId) {
                        throw error; // Only throw if they provided a value
                    }
                }

                try {
                    await findProgramId(program || programId);
                } catch (error: any) {
                    if (program || programId) {
                        throw error; // Only throw if they provided a value
                    }
                }

                // Advisor is mandatory for students, optional for others
                const isStudent = role === 'STUDENT';
                try {
                    await findAdvisorId(advisor || advisorId, isStudent);
                } catch (error: any) {
                    // For students, always throw (advisor is mandatory)
                    // For others, only throw if they provided a value
                    if (isStudent || advisor || advisorId) {
                        throw error;
                    }
                }

                // If we got here, the row is valid
                results.valid++;
                results.validRows.push({
                    rowNumber,
                    name,
                    email,
                    role,
                    department: department || departmentId || null,
                });
            } catch (error: any) {
                results.invalid++;
                results.errors.push({
                    row: rowNumber,
                    email: userData.email || 'N/A',
                    error: error.message,
                });
            }
        }

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: 'Failed to validate CSV data' },
            { status: 500 }
        );
    }
}
