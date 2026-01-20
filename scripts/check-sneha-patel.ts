import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSneha() {
    try {
        console.log('Checking Sneha Patel (student2@iitrpr.ac.in)...\n');

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: 'student2@iitrpr.ac.in' },
            include: {
                student: true
            }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log(`✓ User found:`);
        console.log(`  - ID: ${user.id}`);
        console.log(`  - Name: ${user.name}`);
        console.log(`  - Role: ${user.role}`);
        console.log(`  - Student record: ${user.student ? 'EXISTS' : 'MISSING ❌'}`);

        if (user.student) {
            console.log(`\nStudent details:`);
            console.log(`  - Student ID: ${user.student.id}`);
            console.log(`  - Entry Number: ${user.student.entryNumber}`);
            console.log(`  - User ID link: ${user.student.userId}`);
        } else {
            console.log('\n⚠️  No Student record found for this user!');

            // Check if there's a student with a different userId
            const allStudents = await prisma.student.findMany({
                where: {
                    OR: [
                        { entryNumber: { contains: '2021CSB1071' } },
                        { entryNumber: { contains: 'sneha' } }
                    ]
                },
                include: { user: true }
            });

            console.log(`\nSearching for student records with similar entry numbers...`);
            console.log(`Found ${allStudents.length} records:`);
            allStudents.forEach(s => {
                console.log(`  - Entry: ${s.entryNumber}, UserID: ${s.userId}, User Email: ${s.user?.email}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSneha();
