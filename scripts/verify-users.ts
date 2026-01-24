/**
 * Verification Script - Check Uploaded Users
 * 
 * This script checks the database for users created from CSV upload
 * Run with: npx tsx scripts/verify-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying uploaded users...\n');

    // Get all users with their profiles
    const users = await prisma.user.findMany({
        include: {
            student: {
                include: {
                    department: true,
                    program: true,
                    advisor: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
            instructor: {
                include: {
                    department: true,
                },
            },
            advisor: {
                include: {
                    department: true,
                    program: true,
                },
            },
            admin: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Count by role
    const stats = {
        total: users.length,
        students: users.filter((u) => u.role === 'STUDENT').length,
        instructors: users.filter((u) => u.role === 'INSTRUCTOR').length,
        advisors: users.filter((u) => u.role === 'ADVISOR').length,
        admins: users.filter((u) => u.role === 'ADMIN').length,
    };

    console.log('📊 User Statistics:');
    console.log('─'.repeat(50));
    console.log(`Total Users:       ${stats.total}`);
    console.log(`Students:          ${stats.students}`);
    console.log(`Instructors:       ${stats.instructors}`);
    console.log(`Advisors:          ${stats.advisors}`);
    console.log(`Admins:            ${stats.admins}`);
    console.log('─'.repeat(50));
    console.log('');

    // Show recent students
    const recentStudents = users
        .filter((u) => u.role === 'STUDENT')
        .slice(0, 10);

    if (recentStudents.length > 0) {
        console.log('📚 Recent Students (last 10):');
        console.log('─'.repeat(80));
        recentStudents.forEach((user, idx) => {
            console.log(`${idx + 1}. ${user.student?.entryNumber || 'N/A'} - ${user.name || 'N/A'}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Department: ${user.student?.department?.code || 'N/A'}`);
            console.log(`   Program: ${user.student?.program?.code || 'N/A'}`);
            console.log(`   Batch: ${user.student?.batch || 'N/A'}`);
            console.log(`   Advisor: ${user.student?.advisor?.user.name || 'N/A'}`);
            console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
            console.log('');
        });
    }

    // Show recent instructors
    const recentInstructors = users
        .filter((u) => u.role === 'INSTRUCTOR')
        .slice(0, 5);

    if (recentInstructors.length > 0) {
        console.log('👨‍🏫 Recent Instructors (last 5):');
        console.log('─'.repeat(80));
        recentInstructors.forEach((user, idx) => {
            console.log(`${idx + 1}. ${user.instructor?.title || ''} ${user.name || 'N/A'}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Department: ${user.instructor?.department?.code || 'N/A'}`);
            console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
            console.log('');
        });
    }

    // Check for students without advisors
    const studentsWithoutAdvisors = users.filter(
        (u) => u.role === 'STUDENT' && !u.student?.advisorId
    );

    if (studentsWithoutAdvisors.length > 0) {
        console.log(`⚠️  Warning: ${studentsWithoutAdvisors.length} students without advisors`);
    }

    // Check for users without departments
    const usersWithoutDept = users.filter((u) => {
        if (u.role === 'STUDENT') return !u.student?.departmentId;
        if (u.role === 'INSTRUCTOR') return !u.instructor?.departmentId;
        if (u.role === 'ADVISOR') return !u.advisor?.departmentId;
        return false;
    });

    if (usersWithoutDept.length > 0) {
        console.log(`⚠️  Warning: ${usersWithoutDept.length} users without departments`);
    }

    console.log('\n✅ Verification complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error during verification:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
