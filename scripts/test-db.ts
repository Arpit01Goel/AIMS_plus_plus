/**
 * Quick Test: Verify Prisma Client Connection
 * Run with: npx tsx scripts/test-db.ts
 */

import { prisma } from '../src/lib/db';

async function testConnection() {
  try {
    console.log('🔌 Testing Prisma connection...\n');
    
    // Test 1: Count users
    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}`);
    
    // Test 2: Count departments
    const deptCount = await prisma.department.count();
    console.log(`✅ Departments in database: ${deptCount}`);
    
    // Test 3: Get current academic session
    const currentSession = await prisma.academicSession.findFirst({
      where: { isCurrent: true },
    });
    console.log(`✅ Current session: ${currentSession?.code || 'None'}`);
    
    // Test 4: Sample student with enrollments
    const studentWithCourses = await prisma.student.findFirst({
      include: {
        user: { select: { name: true, email: true } },
        enrollments: {
          include: {
            offering: {
              include: {
                course: { select: { code: true, title: true } },
              },
            },
          },
        },
      },
    });
    
    if (studentWithCourses) {
      console.log(`\n✅ Sample student: ${studentWithCourses.user.name}`);
      console.log(`   Entry: ${studentWithCourses.entryNumber}`);
      console.log(`   Email: ${studentWithCourses.user.email}`);
      console.log(`   Enrolled courses: ${studentWithCourses.enrollments.length}`);
      
      studentWithCourses.enrollments.forEach((enrollment) => {
        console.log(`   - ${enrollment.offering.course.code}: ${enrollment.offering.course.title}`);
      });
    }
    
    console.log('\n✅ All tests passed! Database is ready.\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
