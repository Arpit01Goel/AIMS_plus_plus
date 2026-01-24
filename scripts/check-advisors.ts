import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  // Check students
  const students = await prisma.student.findMany({
    include: {
      user: { select: { email: true, name: true } },
      advisor: { select: { id: true, isAdvisor: true } },
    },
  });

  console.log('=== STUDENTS ===');
  students.forEach((s) => {
    console.log(`Student: ${s.entryNumber} (${s.user.email})`);
    console.log(`  Advisor ID: ${s.advisorId || 'NONE'}`);
    if (s.advisor) {
      console.log(`  Advisor isAdvisor: ${s.advisor.isAdvisor}`);
    }
    console.log('');
  });

  // Check instructors
  const instructors = await prisma.instructor.findMany({
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { advisees: true } },
    },
  });

  console.log('=== INSTRUCTORS ===');
  instructors.forEach((i) => {
    console.log(`Instructor: ${i.user.name} (${i.user.email})`);
    console.log(`  isAdvisor: ${i.isAdvisor}`);
    console.log(`  Advisee count: ${i._count.advisees}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
