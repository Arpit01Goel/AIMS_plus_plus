import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAcademicSession() {
    try {
        console.log('Checking academic sessions...\n');

        // Get all sessions
        const allSessions = await prisma.academicSession.findMany({
            orderBy: { startDate: 'desc' }
        });

        console.log(`Total academic sessions: ${allSessions.length}`);
        allSessions.forEach(session => {
            console.log(`- ${session.code} (${session.isCurrent ? 'CURRENT' : 'not current'}): ${session.startDate.toLocaleDateString()} - ${session.endDate.toLocaleDateString()}`);
        });

        // Get current session
        const currentSession = await prisma.academicSession.findFirst({
            where: { isCurrent: true }
        });

        if (!currentSession) {
            console.log('\n❌ No current academic session found!');
            return;
        }

        console.log(`\n✓ Current session: ${currentSession.code}`);

        // Check course offerings for current session
        const offerings = await prisma.courseOffering.findMany({
            where: { academicSessionId: currentSession.id },
            include: {
                course: true,
                primaryInstructor: {
                    include: { user: true }
                }
            }
        });

        console.log(`\n✓ Course offerings in current session: ${offerings.length}`);

        if (offerings.length === 0) {
            console.log('\n⚠️  WARNING: No course offerings found for the current session!');
            console.log('This is why the courses page returns empty results.');
        } else {
            console.log('\nCourse offerings:');
            offerings.forEach(offering => {
                console.log(`- ${offering.course.code}: ${offering.course.title} (${offering.status})`);
                console.log(`  Instructor: ${offering.primaryInstructor?.user?.name || 'TBA'}`);
            });
        }

        // Check enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: {
                offering: {
                    academicSessionId: currentSession.id
                }
            }
        });

        console.log(`\n✓ Total enrollments in current session: ${enrollments.length}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAcademicSession();
