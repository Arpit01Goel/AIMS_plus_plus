import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        student: {
          include: {
            program: true,
            department: true,
            profile: true,
            record: true, // Include StudentRecord
          },
        },
        instructor: {
          include: {
            department: true,
            courseOfferings: {
              include: {
                course: true,
                academicSession: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build role-specific profile
    let profile: any = {
      name: user.name || 'N/A',
      email: user.email,
      role: user.role,
    };

    if (user.role === 'STUDENT' && user.student) {
      const student = user.student;

      // Calculate department rank (among same batch in same department)
      let deptRank = null;
      if (student.departmentId && student.batch && student.record) {
        const deptStudents = await prisma.student.findMany({
          where: {
            departmentId: student.departmentId,
            batch: student.batch,
            record: { isNot: null },
          },
          include: { record: true },
          orderBy: { record: { cgpa: 'desc' } },
        });
        deptRank = deptStudents.findIndex(s => s.id === student.id) + 1;
      }

      // Calculate institute rank (among same batch)
      let instituteRank = null;
      if (student.batch && student.record) {
        const allStudents = await prisma.student.findMany({
          where: {
            batch: student.batch,
            record: { isNot: null },
          },
          include: { record: true },
          orderBy: { record: { cgpa: 'desc' } },
        });
        instituteRank = allStudents.findIndex(s => s.id === student.id) + 1;
      }

      profile = {
        ...profile,
        // Basic student info
        entryNumber: user.student.entryNumber,
        batch: user.student.batch,
        program: user.student.program?.name || 'N/A',
        programCode: user.student.program?.code || 'N/A',
        department: user.student.department?.name || 'N/A',
        departmentCode: user.student.department?.code || 'N/A',
        phone: user.student.phone || 'N/A',
        address: user.student.address || 'N/A',

        // Academic performance from StudentRecord
        studentRecord: user.student.record ? {
          cgpa: user.student.record.cgpa,
          totalCredits: user.student.record.totalCredits,
          totalEarnedCredits: user.student.record.totalEarnedCredits,
          lastCalculated: user.student.record.lastCalculated,
          deptRank,
          instituteRank,
        } : null,

        // Complete StudentProfile data (if exists)
        studentProfile: user.student.profile ? {
          // Personal Information
          dateOfBirth: user.student.profile.dateOfBirth,
          gender: user.student.profile.gender,
          bloodGroup: user.student.profile.bloodGroup,
          nationality: user.student.profile.nationality,
          category: user.student.profile.category,

          // Contact Information
          personalEmail: user.student.profile.personalEmail,
          phoneNumber: user.student.profile.phoneNumber,
          alternatePhone: user.student.profile.alternatePhone,

          // Permanent Address
          permanentAddress: user.student.profile.permanentAddress,
          permanentCity: user.student.profile.permanentCity,
          permanentState: user.student.profile.permanentState,
          permanentPincode: user.student.profile.permanentPincode,

          // Current Address
          currentAddress: user.student.profile.currentAddress,
          currentCity: user.student.profile.currentCity,
          currentState: user.student.profile.currentState,
          currentPincode: user.student.profile.currentPincode,

          // Guardian Information
          fatherName: user.student.profile.fatherName,
          fatherOccupation: user.student.profile.fatherOccupation,
          fatherPhone: user.student.profile.fatherPhone,
          motherName: user.student.profile.motherName,
          motherOccupation: user.student.profile.motherOccupation,
          motherPhone: user.student.profile.motherPhone,
          guardianName: user.student.profile.guardianName,
          guardianRelation: user.student.profile.guardianRelation,
          guardianPhone: user.student.profile.guardianPhone,

          // Academic Information
          tenthBoard: user.student.profile.tenthBoard,
          tenthPercentage: user.student.profile.tenthPercentage,
          tenthYearOfPassing: user.student.profile.tenthYearOfPassing,
          twelfthBoard: user.student.profile.twelfthBoard,
          twelfthPercentage: user.student.profile.twelfthPercentage,
          twelfthYearOfPassing: user.student.profile.twelfthYearOfPassing,
          jeeRank: user.student.profile.jeeRank,
          admissionQuota: user.student.profile.admissionQuota,

          // Additional Info
          hobbies: user.student.profile.hobbies,
          achievements: user.student.profile.achievements,
          profilePicture: user.student.profile.profilePicture,
        } : null,
      };
    } else if (user.role === 'INSTRUCTOR' && user.instructor) {
      const coursesTaught = user.instructor.courseOfferings.map((offering) => ({
        code: offering.course.code,
        title: offering.course.title,
        session: offering.academicSession.code,
        credits: offering.course.credits,
      }));

      const currentSession = user.instructor.courseOfferings.filter(
        (o: any) => o.status === 'RUNNING' || o.status === 'ENROLLING'
      );

      const allEnrollments = await prisma.enrollment.findMany({
        where: {
          offering: {
            instructorId: user.instructor.id,
          },
          status: 'ENROLLED' as any,
        },
      });

      profile = {
        ...profile,
        designation: user.instructor.title || 'Instructor',
        department: user.instructor.department?.name || 'N/A',
        departmentCode: user.instructor.department?.code || 'N/A',
        phone: 'N/A',
        office: 'N/A',
        coursesTaught,
        stats: {
          coursesThisSemester: currentSession.length,
          totalStudents: allEnrollments.length,
          yearsOfExperience: 0,
          publications: 0,
        },
      };

      // Add advisor-specific data if instructor is an advisor
      if (user.instructor?.isAdvisor) {
        const adviseeCount = await prisma.student.count({
          where: { advisorId: user.instructor.id },
        });
        
        profile = {
          ...profile,
          isAdvisor: true,
          primaryCohort: user.instructor.primaryCohort,
          advisorNotes: user.instructor.advisorNotes,
          totalAdvisees: adviseeCount,
        };
      }
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      address,
      title,
      phoneNumber,
      alternatePhone,
      permanentAddress,
      currentAddress,
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        student: {
          include: {
            profile: true
          }
        },
        instructor: true
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Update role-specific fields
    if (user.role === 'STUDENT' && user.student) {
      // Update basic student fields
      await prisma.student.update({
        where: { id: user.student.id },
        data: {
          ...(phone && { phone }),
          ...(address && { address }),
        },
      });

      // Update or create StudentProfile with contact information
      if (phoneNumber || alternatePhone || permanentAddress || currentAddress) {
        const profileData = {
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(alternatePhone !== undefined && { alternatePhone }),
          ...(permanentAddress !== undefined && { permanentAddress }),
          ...(currentAddress !== undefined && { currentAddress }),
        };

        if (user.student.profile) {
          // Update existing profile
          await prisma.studentProfile.update({
            where: { studentId: user.student.id },
            data: profileData,
          });
        } else {
          // Create new profile
          await prisma.studentProfile.create({
            data: {
              studentId: user.student.id,
              ...profileData,
            },
          });
        }
      }
    } else if (user.role === 'INSTRUCTOR' && user.instructor) {
      await prisma.instructor.update({
        where: { id: user.instructor.id },
        data: {
          ...(title && { title }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
