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

const semestersData = [
  {
    semesterCode: "2024-II",
    semesterName: "Jan-May 2025",
    sgpa: 9.61,
    cgpa: 9.61,
    totalCredits: 18,
    earnedCredits: 18,
    courses: [
      {
        courseCode: "MA101",
        courseName: "CALCULUS (3-1-0-5-3)",
        credits: 3,
        grade: "A",
        gradePoints: 10,
        category: "SC",
        attendance: 95
      },
      {
        courseCode: "CY101",
        courseName: "CHEMISTRY FOR ENGINEERS (3-1-2-6-4)",
        credits: 4,
        grade: "A",
        gradePoints: 10,
        category: "SC",
        attendance: 96
      },
      {
        courseCode: "GE103",
        courseName: "INTRODUCTION TO COMPUTING AND DATA STRUCTURES (3-0-3-15/2-4.5)",
        credits: 4.5,
        grade: "A-",
        gradePoints: 9,
        category: "GR",
        attendance: 98
      },
      {
        courseCode: "HS103",
        courseName: "PROFESSIONAL ENGLISH COMMUNICATION (2-0-2-5-3)",
        credits: 3,
        grade: "A",
        gradePoints: 10,
        category: "HC",
        attendance: 92
      },
      {
        courseCode: "NO101",
        courseName: "NSO I (0-0-2-1-1)",
        credits: 1,
        grade: "A",
        gradePoints: 10,
        category: "NN",
        attendance: 100
      },
      {
        courseCode: "GE105",
        courseName: "ENGINEERING DRAWING (0-0-3-3/2-1.5)",
        credits: 1.5,
        grade: "A-",
        gradePoints: 9,
        category: "GR",
        attendance: 94
      },
      {
        courseCode: "GE101",
        courseName: "TECHNOLOGY MUSEUM LAB (0-0-2-1-1)",
        credits: 1,
        grade: "A-",
        gradePoints: 9,
        category: "GR",
        attendance: 100
      }
    ]
  },
  {
    semesterCode: "2025-I",
    semesterName: "July-Dec 2025",
    sgpa: 9.05,
    cgpa: 9.33,
    totalCredits: 18.5,
    earnedCredits: 18.5,
    courses: [
      {
        courseCode: "CS101",
        courseName: "DISCRETE MATHEMATICAL STRUCTURES (3-1-0-5-3)",
        credits: 3,
        grade: "B",
        gradePoints: 8,
        category: "PC",
        attendance: 89
      },
      {
        courseCode: "HS101",
        courseName: "HISTORY OF TECHNOLOGY (3/2-1/2-0-5/2-1.5)",
        credits: 1.5,
        grade: "A-",
        gradePoints: 9,
        category: "HC",
        attendance: 91
      },
      {
        courseCode: "PH101",
        courseName: "Physics for Engineers (3-1-0-5-3)",
        credits: 3,
        grade: "A-",
        gradePoints: 9,
        category: "SC",
        attendance: 93
      },
      {
        courseCode: "PH102",
        courseName: "Physics for Engineers Lab (0-0-4-2-2)",
        credits: 2,
        grade: "A-",
        gradePoints: 9,
        category: "SC",
        attendance: 96
      },
      {
        courseCode: "MA102",
        courseName: "LINEAR ALGEBRA, INTEGRAL TRANSFORMS AND SPECIAL FUNCTIONS (3-1-0-5-3)",
        credits: 3,
        grade: "A-",
        gradePoints: 9,
        category: "SC",
        attendance: 90
      },
      {
        courseCode: "GE104",
        courseName: "INTRODUCTION TO ELECTRICAL ENGINEERING (2-2/3-2-13/3-3)",
        credits: 3,
        grade: "A",
        gradePoints: 10,
        category: "GR",
        attendance: 95
      },
      {
        courseCode: "GE102",
        courseName: "WORKSHOP PRACTICE (0-0-4-2-2)",
        credits: 2,
        grade: "A-",
        gradePoints: 9,
        category: "GR",
        attendance: 97
      },
      {
        courseCode: "NO102",
        courseName: "NSO II (0-0-2-1-1)",
        credits: 1,
        grade: "A",
        gradePoints: 10,
        category: "NN",
        attendance: 100
      }
    ]
  }
];


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
  await prisma.studentRecord.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.student.deleteMany();
  await prisma.instructor.deleteMany();
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

  // Create Advisor User (instructor with advisor role)
  console.log('🧑‍💼 Creating advisor user...');
  const advisorUser = await prisma.user.create({
    data: {
      email: 'advisor@iitrpr.ac.in',
      passwordHash: defaultPasswordHash,
      name: 'Prof. Priya Sharma',
      role: Role.INSTRUCTOR,
      instructor: {
        create: {
          title: 'Prof.',
          officialEmail: 'priya.sharma@iitrpr.ac.in',
          isAdvisor: true,
          primaryCohort: 2023,
          advisorNotes: 'Primary advisor for CSE B.Tech 2023 batch',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // Get advisor ID for student relation
  const advisor = await prisma.instructor.findUnique({
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

  // Get student profiles for creating profiles and enrollments later
  const student1 = await prisma.student.findUnique({
    where: { userId: student1User.id },
  });
  const student2 = await prisma.student.findUnique({
    where: { userId: student2User.id },
  });

  // Create Student Profiles
  console.log('📝 Creating student profiles...');
  if (student1) {
    await prisma.studentProfile.create({

      data: {
        studentId: student1.id,
        // Personal Information
        dateOfBirth: new Date('2004-07-15'),
        gender: 'Male',
        bloodGroup: 'A+',
        nationality: 'Indian',
        category: 'OBC',

        // Contact Information
        personalEmail: 'amit.verma@gmail.com',
        phoneNumber: '+91-9876543210',
        alternatePhone: '+91-8765432109',

        // Permanent Address
        permanentAddress: 'Plot No. 42, Green Avenue',
        permanentCity: 'Jaipur',
        permanentState: 'Rajasthan',
        permanentPincode: '302017',

        // Current Address
        currentAddress: 'Hostel B, Room 305, IIT Ropar',
        currentCity: 'Rupnagar',
        currentState: 'Punjab',
        currentPincode: '140001',

        // Guardian Information
        fatherName: 'Rajesh Verma',
        fatherOccupation: 'Business',
        fatherPhone: '+91-9876512345',

        motherName: 'Sunita Verma',
        motherOccupation: 'Teacher',
        motherPhone: '+91-9876567890',

        guardianName: 'Rajesh Verma',
        guardianRelation: 'Father',
        guardianPhone: '+91-9876512345',

        // Academic Information
        tenthBoard: 'CBSE',
        tenthPercentage: 95.2,
        tenthYearOfPassing: 2020,

        twelfthBoard: 'CBSE',
        twelfthPercentage: 93.8,
        twelfthYearOfPassing: 2022,

        jeeRank: 2450,
        admissionQuota: 'OBC',

        // Additional Information
        hobbies: 'Reading, Coding, Chess',
        achievements: 'National Science Olympiad Gold Medal, State Level Cricket Champion',
      },
    });

    // Create Student Record for Amit Verma
    console.log('📊 Creating student record for Amit Verma...');
    await prisma.studentRecord.create({
      data: {
        studentId: student1.id,
        cgpa: 9.33,
        totalCredits: 36.5,
        totalEarnedCredits: 36.5,
        semestersData: semestersData,
      },
    });
  }

  if (student2) {
    await prisma.studentProfile.create({
      data: {
        studentId: student2.id,
        dateOfBirth: new Date('2004-08-22'),
        gender: 'Female',
        bloodGroup: 'B+',
        nationality: 'Indian',
        category: 'OBC',
        personalEmail: 'sneha.patel@gmail.com',
        phoneNumber: '+91-9876543211',
        alternatePhone: '+91-9876543220',
        permanentAddress: '456, Park Street, Anand',
        permanentCity: 'Anand',
        permanentState: 'Gujarat',
        permanentPincode: '388001',
        currentAddress: 'Hostel B, Room 205, IIT Ropar',
        currentCity: 'Rupnagar',
        currentState: 'Punjab',
        currentPincode: '140001',
        fatherName: 'Mahesh Patel',
        fatherOccupation: 'Engineer',
        fatherPhone: '+91-9876543221',
        motherName: 'Meera Patel',
        motherOccupation: 'Doctor',
        motherPhone: '+91-9876543222',
        tenthBoard: 'GSEB',
        tenthPercentage: 96.2,
        tenthYearOfPassing: 2019,
        twelfthBoard: 'GSEB',
        twelfthPercentage: 94.5,
        twelfthYearOfPassing: 2021,
        jeeRank: 980,
        admissionQuota: 'Open',
        hobbies: 'Reading, Painting, Dance',
        achievements: 'National level debate winner, Science olympiad gold medalist',
      },
    });
  }

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
      category: 'SC', // Science Core
      departmentId: cseDept.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      code: 'CS201',
      title: 'Data Structures & Algorithms',
      credits: 4,
      ltpsc: '3-1-0-0-4',
      category: 'PC', // Program Core
      departmentId: cseDept.id,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      code: 'CS301',
      title: 'Machine Learning',
      credits: 3,
      ltpsc: '3-0-0-0-3',
      category: 'PE', // Program Elective
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
      status: 'ENROLLING', // Course is open for enrollment
      allowedBatches: ['2023'],
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
      status: 'RUNNING', // Course is currently running
      allowedBatches: ['2023'],
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
      status: 'ENROLLING', // Course is open for enrollment
      allowedBatches: ['2023'],
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

  // Get student profiles (already fetched above when creating profiles)
  // const student1 = await prisma.student.findUnique({
  //   where: { userId: student1User.id },
  // });
  // const student2 = await prisma.student.findUnique({
  //   where: { userId: student2User.id },
  // });

  // Create Enrollments
  console.log('✅ Creating enrollments...');
  if (student1) {
    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        offeringId: offering1.id,
        status: 'ENROLLED',
        enrollmentType: 'CREDIT',
        grade: 'A',
        attendancePercentage: 95.5,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student1.id,
        offeringId: offering2.id,
        status: 'PENDING_INSTRUCTOR_APPROVAL',
        enrollmentType: 'CREDIT',
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
        enrollmentType: 'CREDIT',
        grade: 'B',
        attendancePercentage: 92.3,
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student2.id,
        offeringId: offering3.id,
        status: 'PENDING_ADVISOR_APPROVAL',
        enrollmentType: 'AUDIT',
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
      type: 'ACADEMIC', // Changed from HOLIDAY (no longer in EventType enum)
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
  console.log('   - 2 Student profiles with detailed information');
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
