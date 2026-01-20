import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const sessionUserId = 'cmkjtlzf5000kggogkzbsbwso';

        console.log(`Checking user with ID: ${sessionUserId}\n`);

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: sessionUserId },
            include: {
                student: true,
                instructor: true,
                advisor: true
            }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log(`✓ You are logged in as:`);
        console.log(`  - Name: ${user.name}`);
        console.log(`  - Email: ${user.email}`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - User ID: ${user.id}`);
        console.log(`\n  - Student record: ${user.student ? '✓ EXISTS' : '❌ MISSING'}`);
        console.log(`  - Instructor record: ${user.instructor ? '✓ EXISTS' : '❌ MISSING'}`);
        console.log(`  - Advisor record: ${user.advisor ? '✓ EXISTS' : '❌ MISSING'}`);

        if (user.role === 'STUDENT' && !user.student) {
            console.log('\n⚠️  PROBLEM: User role is STUDENT but no Student record exists!');
            console.log('   This needs to be fixed by creating a Student record for this user.');
        }

        // Show the correct Sneha Patel for comparison
        console.log('\n\n--- For comparison ---');
        const sneha = await prisma.user.findUnique({
            where: { email: 'student2@iitrpr.ac.in' },
            include: { student: true }
        });

        if (sneha) {
            console.log(`Sneha Patel (student2@iitrpr.ac.in):`);
            console.log(`  - User ID: ${sneha.id}`);
            console.log(`  - Student record: ${sneha.student ? `✓ Entry ${sneha.student.entryNumber}` : '❌ MISSING'}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
