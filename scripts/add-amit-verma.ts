import { PrismaClient } from '@prisma/client';

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

async function updateAmitVerma() {
    try {
        console.log('🚀 Updating Amit Verma (student1@iitrpr.ac.in) with profile data...\n');

        // 1. Find existing user
        console.log('� Finding existing user...');
        const user = await prisma.user.findUnique({
            where: { email: 'student1@iitrpr.ac.in' },
            include: { student: true },
        });

        if (!user) {
            throw new Error('User student1@iitrpr.ac.in not found!');
        }

        if (!user.student) {
            throw new Error('Student profile not found for this user!');
        }

        console.log('✅ Found user:', user.email);
        console.log('✅ Found student:', user.student.entryNumber);

        const student = user.student;

        // 2. Create or update StudentProfile
        console.log('\n� Creating/Updating Student Profile...');
        const profile = await prisma.studentProfile.upsert({
            where: { studentId: student.id },
            update: {
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
                profilePicture: null,
            },
            create: {
                studentId: student.id,

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
                profilePicture: null,
            },
        });
        console.log('✅ Student Profile created/updated');

        // 3. Create or update StudentRecord
        console.log('\n📊 Creating/Updating Student Record...');
        const record = await prisma.studentRecord.upsert({
            where: { studentId: student.id },
            update: {
                cgpa: 9.33,
                totalCredits: 160,
                totalEarnedCredits: 36.5,
                semestersData: semestersData,
            },
            create: {
                studentId: student.id,
                cgpa: 9.33,
                totalCredits: 36.5,
                totalEarnedCredits: 36.5,
                semestersData: semestersData,
            },
        });
        console.log('✅ Student Record created/updated');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 SUCCESS! Amit Verma profile updated');
        console.log('='.repeat(50));
        console.log('\n📧 Login Credentials:');
        console.log('   Email: student1@iitrpr.ac.in');
        console.log('   Password: (existing password)');
        console.log('\n📝 Updated Details:');
        console.log('   Name:', user.name);
        console.log('   Entry Number:', student.entryNumber);
        console.log('   Batch:', student.batch);
        console.log('   Phone: +91-9876543210');
        console.log('   Personal Email: amit.verma@gmail.com');
        console.log('\n✅ Profile now includes:');
        console.log('   • Personal Information (DOB, Gender, Blood Group)');
        console.log('   • Contact Details (Phone, Email, Addresses)');
        console.log('   • Guardian Information (Parents details)');
        console.log('   • Academic Background (10th, 12th, JEE Rank)');
        console.log('   • Additional Info (Hobbies, Achievements)');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Error updating student:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
updateAmitVerma()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
