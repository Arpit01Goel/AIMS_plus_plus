/**
 * Get IDs Script - Get Department, Program, and Advisor IDs
 * 
 * This script displays all available IDs for use in CSV uploads
 * Run with: npx tsx scripts/get-ids.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('📋 Getting IDs for CSV Upload...\n');

    // Get all departments
    const departments = await prisma.department.findMany({
        include: {
            programs: true,
        },
        orderBy: {
            code: 'asc',
        },
    });

    console.log('🏢 DEPARTMENTS:');
    console.log('─'.repeat(80));
    departments.forEach((dept) => {
        console.log(`${dept.code} - ${dept.name}`);
        console.log(`ID: ${dept.id}`);
        console.log('');
    });

    // Get all programs
    console.log('\n🎓 PROGRAMS:');
    console.log('─'.repeat(80));
    departments.forEach((dept) => {
        if (dept.programs.length > 0) {
            console.log(`\n${dept.code} Programs:`);
            dept.programs.forEach((program) => {
                console.log(`  ${program.code} - ${program.name}`);
                console.log(`  ID: ${program.id}`);
            });
        }
    });

    // Get all advisors
    const advisors = await prisma.advisor.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
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
        },
        orderBy: {
            user: {
                name: 'asc',
            },
        },
    });

    console.log('\n\n👨‍💼 ADVISORS:');
    console.log('─'.repeat(80));
    if (advisors.length === 0) {
        console.log('No advisors found in the database.');
        console.log('You may need to create advisors first before assigning them to students.');
    } else {
        advisors.forEach((advisor) => {
            console.log(`${advisor.user.name} (${advisor.user.email})`);
            console.log(`ID: ${advisor.id}`);
            console.log(`Department: ${advisor.department?.code || 'N/A'}`);
            console.log(`Program: ${advisor.program?.code || 'N/A'}`);
            console.log('');
        });
    }

    // Generate sample CSV rows
    console.log('\n\n📝 SAMPLE CSV ROWS:');
    console.log('─'.repeat(80));

    if (departments.length > 0 && departments[0].programs.length > 0) {
        const dept = departments[0];
        const program = dept.programs[0];
        const advisor = advisors.length > 0 ? advisors[0] : null;

        console.log('\nExample 1: Student with full details');
        console.log('─'.repeat(80));
        console.log(`name,email,password,role,entryNumber,batch,phone,address,departmentId,programId,advisorId,title,officialEmail`);
        console.log(`John Doe,student1@iitrpr.ac.in,password123,STUDENT,2024CSB1001,2024,+91-9876543210,Hostel A Room 101,${dept.id},${program.id},${advisor?.id || ''},,`);

        console.log('\n\nExample 2: Student with minimal details (no advisor)');
        console.log('─'.repeat(80));
        console.log(`name,email,password,role,entryNumber,batch,phone,address,departmentId,programId,advisorId,title,officialEmail`);
        console.log(`Jane Smith,student2@iitrpr.ac.in,password123,STUDENT,2024CSB1002,2024,,,,,,,`);

        console.log('\n\nExample 3: Instructor');
        console.log('─'.repeat(80));
        console.log(`name,email,password,role,entryNumber,batch,phone,address,departmentId,programId,advisorId,title,officialEmail`);
        console.log(`Dr. Rajesh Kumar,instructor1@iitrpr.ac.in,password123,INSTRUCTOR,,,,,${dept.id},,,Dr.,instructor1@iitrpr.ac.in`);
    }

    console.log('\n\n💡 TIPS:');
    console.log('─'.repeat(80));
    console.log('1. Copy the IDs above and use them in your CSV file');
    console.log('2. departmentId, programId, and advisorId are optional');
    console.log('3. Leave fields empty (just commas) if not needed');
    console.log('4. Ensure role is uppercase: STUDENT, INSTRUCTOR, ADVISOR, ADMIN');
    console.log('5. Entry number is required for students');
    console.log('6. Email must end with @iitrpr.ac.in');
    console.log('');

    console.log('✅ Done! Use these IDs in your CSV file.');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
