import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * PUT /api/admin/departments/[id]
 * Update a department (admin only)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const { code, name } = body;

        // Validation
        if (!code || !name) {
            return NextResponse.json(
                { error: 'Department code and name are required' },
                { status: 400 }
            );
        }

        // Validate code format (uppercase letters, numbers, and hyphens only)
        const codeRegex = /^[A-Z0-9-]+$/;
        if (!codeRegex.test(code)) {
            return NextResponse.json(
                { error: 'Department code must contain only uppercase letters, numbers, and hyphens' },
                { status: 400 }
            );
        }

        // Check if department exists
        const existingDept = await prisma.department.findUnique({
            where: { id },
        });

        if (!existingDept) {
            return NextResponse.json(
                { error: 'Department not found' },
                { status: 404 }
            );
        }

        // Check if new code conflicts with another department
        if (code !== existingDept.code) {
            const codeConflict = await prisma.department.findUnique({
                where: { code },
            });

            if (codeConflict) {
                return NextResponse.json(
                    { error: 'A department with this code already exists' },
                    { status: 409 }
                );
            }
        }

        // Update the department
        const department = await prisma.department.update({
            where: { id },
            data: {
                code: code.trim().toUpperCase(),
                name: name.trim(),
            },
            include: {
                programs: {
                    orderBy: {
                        name: 'asc',
                    },
                },
                _count: {
                    select: {
                        students: true,
                        instructors: true,
                        courses: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                message: 'Department updated successfully',
                department
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Department PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update department' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/departments/[id]
 * Delete a department (admin only)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Check if department exists
        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        students: true,
                        instructors: true,
                        courses: true,
                        programs: true,
                    },
                },
            },
        });

        if (!department) {
            return NextResponse.json(
                { error: 'Department not found' },
                { status: 404 }
            );
        }

        // Check if department has associated records
        const hasStudents = department._count.students > 0;
        const hasInstructors = department._count.instructors > 0;
        const hasCourses = department._count.courses > 0;
        const hasPrograms = department._count.programs > 0;

        if (hasStudents || hasInstructors || hasCourses || hasPrograms) {
            const dependencies = [];
            if (hasStudents) dependencies.push(`${department._count.students} student(s)`);
            if (hasInstructors) dependencies.push(`${department._count.instructors} instructor(s)`);
            if (hasCourses) dependencies.push(`${department._count.courses} course(s)`);
            if (hasPrograms) dependencies.push(`${department._count.programs} program(s)`);

            return NextResponse.json(
                {
                    error: 'Cannot delete department with associated records',
                    details: `This department has ${dependencies.join(', ')}. Please reassign or remove them first.`
                },
                { status: 409 }
            );
        }

        // Delete the department
        await prisma.department.delete({
            where: { id },
        });

        return NextResponse.json(
            { message: 'Department deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Department DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete department' },
            { status: 500 }
        );
    }
}
