/**
 * Prisma Database Seed Script
 * 
 * Creates initial test data for all roles:
 * - 1 admin user
 * - 1 instructor
 * - 1 advisor
 * - 2 students
 * - Sample departments, programs, courses, and sessions
 * 
 * Run with: npm run seed
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (optional - comment out in production)
  console.log('🧹 Cleaning existing data...');
  await prisma.courseFeedbackResponse.deleteMany();
  await prisma.feedbackQuestion.deleteMany();
  await prisma.feeReceipt.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseMeeting.deleteMany();
  await prisma.courseOffering.deleteMany();
  await prisma.course.deleteMany();
  await prisma.academicSession.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.advisor.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.oTPCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  console.log('📚 Creating departments...');
  const cseDept = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science & Engineering',
    },
  });

  const eeDept = await prisma.department.create({
    data: {
      code: 'EE',
      name: 'Electrical Engineering',
    },
  });

  const meDept = await prisma.department.create({
    data: {
      code: 'ME',
      name: 'Mechanical Engineering',
    },
  });

  // Create programs
  console.log('🎓 Creating programs...');
  const btechCSE = await prisma.program.create({
    data: {
      code: 'BTECH-CSE',
      name: 'B.Tech in Computer Science & Engineering',
      level: 'UG',
      departmentId: cseDept.id,
    },
  });

  const btechEE = await prisma.program.create({
    data: {
      code: 'BTECH-EE',
      name: 'B.Tech in Electrical Engineering',
      level: 'UG',
      departmentId: eeDept.id,
    },
  });

  const mtechDS = await prisma.program.create({
    data: {
      code: 'MTECH-DS',
      name: 'M.Tech in Data Science',
      level: 'PG',
      departmentId: cseDept.id,
    },
  });

  // Hash default password for all users (password: "password123")
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@iitrpr.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'System Admin',
      role: Role.ADMIN,
      admin: {
        create: {
          notes: 'Primary system administrator',
        },
      },
    },
  });

  // Create Instructor User
  console.log('👨‍🏫 Creating instructor user...');
  const instructorUser = await prisma.user.create({
    data: {
      email: 'instructor@iitrpr.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Rajesh Kumar',
      role: Role.INSTRUCTOR,
      instructor: {
        create: {
          title: 'Dr.',
          officialEmail: 'rajesh.kumar@iitrpr.ac.in',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // Create Advisor User
  console.log('🧑‍💼 Creating advisor user...');
  const advisorUser = await prisma.user.create({
    data: {
      email: 'advisor@iitrpr.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Prof. Priya Sharma',
      role: Role.ADVISOR,
      advisor: {
        create: {
          primaryCohort: 2023,
          departmentId: cseDept.id,
          programId: btechCSE.id,
        },
      },
    },
  });

  // Get advisor ID for student relation
  const advisor = await prisma.advisor.findUnique({
    where: { userId: advisorUser.id },
  });

  // Create Student Users
  console.log('👨‍🎓 Creating student users...');
  const student1User = await prisma.user.create({
    data: {
      email: 'student1@iitrpr.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Amit Verma',
      role: Role.STUDENT,
      student: {
        create: {
          entryNumber: '2023CSB1001',
          batch: 2023,
          phone: '+91-9876543210',
          address: 'Hostel A, Room 101',
          programId: btechCSE.id,
          departmentId: cseDept.id,
          advisorId: advisor?.id,
        },
      },
    },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student2@iitrpr.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Sneha Patel',
      role: Role.STUDENT,
      student: {
        create: {
          entryNumber: '2023CSB1002',
          batch: 2023,
          phone: '+91-9876543211',
          address: 'Hostel B, Room 205',
          programId: btechCSE.id,
          departmentId: cseDept.id,
          advisorId: advisor?.id,
        },
      },
    },
  });

  // Create Academic Session
  console.log('📅 Creating academic session...');
  const session2025_2 = await prisma.academicSession.create({
    data: {
      code: '2025-II',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-05-31'),
      isCurrent: true,
    },
  });

  // Create Courses
  console.log('📖 Creating courses...');
  const course1 = await prisma.course.create({
    data: {
      code: 'CS101',
      title: 'Introduction to Programming',
      credits: 4,
      ltpsc: '3-0-2-0-4',
      category: 'CORE',
      departmentId: cseDept.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      code: 'CS201',
      title: 'Data Structures & Algorithms',
      credits: 4,
      ltpsc: '3-1-0-0-4',
      category: 'CORE',
      departmentId: cseDept.id,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      code: 'CS301',
      title: 'Machine Learning',
      credits: 3,
      ltpsc: '3-0-0-0-3',
      category: 'ELECTIVE',
      departmentId: cseDept.id,
    },
  });

  // Get instructor profile
  const instructor = await prisma.instructor.findUnique({
    where: { userId: instructorUser.id },
  });

  // Create Course Offerings
  console.log('🗓️  Creating course offerings...');
  const offering1 = await prisma.courseOffering.create({
    data: {
      courseId: course1.id,
      academicSessionId: session2025_2.id,
      instructorId: instructor?.id,
      capacity: 60,
      slot: 'A1',
      courseMeetings: {
        create: [
          {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '10:00',
            location: 'LH-101',
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '09:00',
            endTime: '10:00',
            location: 'LH-101',
          },
          {
            dayOfWeek: 5, // Friday
            startTime: '09:00',
            endTime: '10:00',
            location: 'LH-101',
          },
        ],
      },
    },
  });

  const offering2 = await prisma.courseOffering.create({
    data: {
      courseId: course2.id,
      academicSessionId: session2025_2.id,
      instructorId: instructor?.id,
      capacity: 50,
      slot: 'B2',
      courseMeetings: {
        create: [
          {
            dayOfWeek: 2, // Tuesday
            startTime: '11:00',
            endTime: '12:00',
            location: 'LH-202',
          },
          {
            dayOfWeek: 4, // Thursday
            startTime: '11:00',
            endTime: '12:00',
            location: 'LH-202',
          },
        ],
      },
    },
  });

  const offering3 = await prisma.courseOffering.create({
    data: {
      courseId: course3.id,
      academicSessionId: session2025_2.id,
      instructorId: instructor?.id,
      capacity: 40,
      slot: 'C1',
      courseMeetings: {
        create: [
          {
            dayOfWeek: 1, // Monday
            startTime: '14:00',
            endTime: '15:00',
            location: 'LH-303',
          },
          {
            dayOfWeek: 3, // Wednesday
            startTime: '14:00',
            endTime: '15:00',
            location: 'LH-303',
          },
        ],
      },
    },
  });

  // Get student profiles
  const student1 = await prisma.student.findUnique({
    where: { userId: student1User.id },
  });
  const student2 = await prisma.student.findUnique({
    where: { userId: student2User.id },
  });

  // Create Enrollments
  console.log('✅ Creating enrollments...');
  if (student1) {
    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        offeringId: offering1.id,
        status: 'ENROLLED',
        attendancePercentage: 95.5,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        offeringId: offering2.id,
        status: 'ENROLLED',
        attendancePercentage: 88.0,
      },
    });
  }

  if (student2) {
    await prisma.enrollment.create({
      data: {
        studentId: student2.id,
        offeringId: offering1.id,
        status: 'ENROLLED',
        attendancePercentage: 92.3,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student2.id,
        offeringId: offering3.id,
        status: 'ENROLLED',
        attendancePercentage: 90.0,
      },
    });
  }

  // Create Sample Fee Receipts
  console.log('💰 Creating fee receipts...');
  if (student1) {
    await prisma.feeReceipt.create({
      data: {
        studentId: student1.id,
        amount: 50000,
        category: 'Tuition Fee - Semester II',
        paidOn: new Date('2025-01-15'),
      },
    });
  }

  if (student2) {
    await prisma.feeReceipt.create({
      data: {
        studentId: student2.id,
        amount: 50000,
        category: 'Tuition Fee - Semester II',
        paidOn: new Date('2025-01-14'),
      },
    });
  }

  // Create Academic Events
  console.log('📆 Creating academic events...');
  await prisma.academicEvent.create({
    data: {
      title: 'Mid-Semester Exams',
      description: 'Mid-semester examinations for all courses',
      startDate: new Date('2025-03-10'),
      endDate: new Date('2025-03-20'),
      type: 'EXAM',
      visibility: 'ALL',
    },
  });

  await prisma.academicEvent.create({
    data: {
      title: 'Course Registration',
      description: 'Registration window for next semester courses',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-05-15'),
      type: 'REGISTRATION',
      visibility: 'STUDENT_ONLY',
    },
  });

  await prisma.academicEvent.create({
    data: {
      title: 'Republic Day',
      description: 'National Holiday',
      startDate: new Date('2025-01-26'),
      endDate: new Date('2025-01-26'),
      type: 'HOLIDAY',
      visibility: 'ALL',
    },
  });

  // Create Feedback Questions
  console.log('💬 Creating feedback questions...');
  await prisma.feedbackQuestion.create({
    data: {
      courseId: course1.id,
      text: 'How would you rate the overall quality of teaching?',
      questionType: 'rating',
      isActive: true,
    },
  });

  await prisma.feedbackQuestion.create({
    data: {
      courseId: course1.id,
      text: 'What did you like most about this course?',
      questionType: 'text',
      isActive: true,
    },
  });

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📋 Summary:');
  console.log('   - 4 Users created (1 admin, 1 instructor, 1 advisor, 2 students)');
  console.log('   - 3 Departments (CSE, EE, ME)');
  console.log('   - 3 Programs (BTECH-CSE, BTECH-EE, MTECH-DS)');
  console.log('   - 1 Academic Session (2025-II)');
  console.log('   - 3 Courses with offerings and meetings');
  console.log('   - 4 Enrollments');
  console.log('   - 2 Fee receipts');
  console.log('   - 3 Academic events');
  console.log('   - 2 Feedback questions');
  console.log('\n🔐 Default password for all users: password123');
  console.log('\n📧 Test credentials:');
  console.log('   Admin:      admin@iitrpr.ac.in');
  console.log('   Instructor: instructor@iitrpr.ac.in');
  console.log('   Advisor:    advisor@iitrpr.ac.in');
  console.log('   Student 1:  student1@iitrpr.ac.in');
  console.log('   Student 2:  student2@iitrpr.ac.in');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
