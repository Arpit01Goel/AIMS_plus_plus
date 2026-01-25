-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('CREDIT', 'AUDIT', 'CREDIT_MINOR', 'CREDIT_CONCENTRATION');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'PENDING_INSTRUCTOR_APPROVAL', 'PENDING_ADVISOR_APPROVAL', 'DROPPED', 'REJECTED_BY_INSTRUCTOR', 'REJECTED_BY_ADVISOR', 'REJECTED_BY_ADMIN', 'WITHDRAWN_BY_STUDENT');

-- CreateEnum
CREATE TYPE "OfferingStatus" AS ENUM ('ENROLLING', 'RUNNING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('A', 'A_MINUS', 'B', 'B_MINUS', 'C', 'C_MINUS', 'D', 'E', 'F', 'I', 'W', 'S', 'U');

-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('SC', 'SE', 'GR', 'PC', 'PE', 'HC', 'HE', 'CP', 'CT', 'NN', 'OC');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('REGISTRATION', 'ACADEMIC', 'FEEDBACK', 'EXAM', 'GRADES');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('STUDENT_ONLY', 'INSTRUCTOR_ONLY', 'ALL');

-- CreateEnum
CREATE TYPE "OTPPurpose" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'TWO_FACTOR_AUTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" "OTPPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTPCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "batch" INTEGER,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "programId" TEXT,
    "departmentId" TEXT,
    "advisorId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "bloodGroup" TEXT,
    "nationality" TEXT,
    "category" TEXT,
    "personalEmail" TEXT,
    "phoneNumber" TEXT,
    "alternatePhone" TEXT,
    "permanentAddress" TEXT,
    "permanentCity" TEXT,
    "permanentState" TEXT,
    "permanentPincode" TEXT,
    "currentAddress" TEXT,
    "currentCity" TEXT,
    "currentState" TEXT,
    "currentPincode" TEXT,
    "fatherName" TEXT,
    "fatherOccupation" TEXT,
    "fatherPhone" TEXT,
    "motherName" TEXT,
    "motherOccupation" TEXT,
    "motherPhone" TEXT,
    "guardianName" TEXT,
    "guardianRelation" TEXT,
    "guardianPhone" TEXT,
    "tenthBoard" TEXT,
    "tenthPercentage" DOUBLE PRECISION,
    "tenthYearOfPassing" INTEGER,
    "twelfthBoard" TEXT,
    "twelfthPercentage" DOUBLE PRECISION,
    "twelfthYearOfPassing" INTEGER,
    "jeeRank" INTEGER,
    "admissionQuota" TEXT,
    "hobbies" TEXT,
    "achievements" TEXT,
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRecord" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEarnedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "semestersData" JSONB,
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "officialEmail" TEXT,
    "isAdvisor" BOOLEAN NOT NULL DEFAULT false,
    "primaryCohort" INTEGER,
    "advisorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicSession" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "ltpsc" TEXT,
    "category" "CourseCategory" NOT NULL,
    "degree" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseOffering" (
    "id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 60,
    "slot" TEXT,
    "status" "OfferingStatus" NOT NULL DEFAULT 'ENROLLING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "instructorId" TEXT,

    CONSTRAINT "CourseOffering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMeeting" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "offeringId" TEXT NOT NULL,

    CONSTRAINT "CourseMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING_INSTRUCTOR_APPROVAL',
    "enrollmentType" "EnrollmentType" NOT NULL DEFAULT 'CREDIT',
    "grade" TEXT,
    "attendancePercentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeReceipt" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL,
    "storagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "FeeReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT,

    CONSTRAINT "FeedbackQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseFeedbackResponse" (
    "id" TEXT NOT NULL,
    "rating" INTEGER,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,

    CONSTRAINT "CourseFeedbackResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" "EventType" NOT NULL DEFAULT 'ACADEMIC',
    "visibility" "EventVisibility" NOT NULL DEFAULT 'ALL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "OTPCode_email_purpose_idx" ON "OTPCode"("email", "purpose");

-- CreateIndex
CREATE INDEX "OTPCode_code_idx" ON "OTPCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_entryNumber_key" ON "Student"("entryNumber");

-- CreateIndex
CREATE INDEX "Student_entryNumber_idx" ON "Student"("entryNumber");

-- CreateIndex
CREATE INDEX "Student_userId_idx" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_advisorId_idx" ON "Student"("advisorId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");

-- CreateIndex
CREATE INDEX "StudentProfile_studentId_idx" ON "StudentProfile"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRecord_studentId_key" ON "StudentRecord"("studentId");

-- CreateIndex
CREATE INDEX "StudentRecord_studentId_idx" ON "StudentRecord"("studentId");

-- CreateIndex
CREATE INDEX "StudentRecord_lastCalculated_idx" ON "StudentRecord"("lastCalculated");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_userId_key" ON "Instructor"("userId");

-- CreateIndex
CREATE INDEX "Instructor_userId_idx" ON "Instructor"("userId");

-- CreateIndex
CREATE INDEX "Instructor_isAdvisor_idx" ON "Instructor"("isAdvisor");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE INDEX "AdminProfile_userId_idx" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_code_idx" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");

-- CreateIndex
CREATE INDEX "Program_code_idx" ON "Program"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicSession_code_key" ON "AcademicSession"("code");

-- CreateIndex
CREATE INDEX "AcademicSession_isCurrent_idx" ON "AcademicSession"("isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_code_idx" ON "Course"("code");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "Course"("category");

-- CreateIndex
CREATE INDEX "CourseOffering_academicSessionId_idx" ON "CourseOffering"("academicSessionId");

-- CreateIndex
CREATE INDEX "CourseOffering_instructorId_idx" ON "CourseOffering"("instructorId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseOffering_courseId_academicSessionId_key" ON "CourseOffering"("courseId", "academicSessionId");

-- CreateIndex
CREATE INDEX "CourseMeeting_offeringId_idx" ON "CourseMeeting"("offeringId");

-- CreateIndex
CREATE INDEX "CourseMeeting_dayOfWeek_idx" ON "CourseMeeting"("dayOfWeek");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_offeringId_idx" ON "Enrollment"("offeringId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_offeringId_key" ON "Enrollment"("studentId", "offeringId");

-- CreateIndex
CREATE INDEX "FeeReceipt_studentId_idx" ON "FeeReceipt"("studentId");

-- CreateIndex
CREATE INDEX "FeeReceipt_paidOn_idx" ON "FeeReceipt"("paidOn");

-- CreateIndex
CREATE INDEX "FeedbackQuestion_courseId_idx" ON "FeedbackQuestion"("courseId");

-- CreateIndex
CREATE INDEX "FeedbackQuestion_isActive_idx" ON "FeedbackQuestion"("isActive");

-- CreateIndex
CREATE INDEX "CourseFeedbackResponse_studentId_idx" ON "CourseFeedbackResponse"("studentId");

-- CreateIndex
CREATE INDEX "CourseFeedbackResponse_enrollmentId_idx" ON "CourseFeedbackResponse"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseFeedbackResponse_questionId_enrollmentId_key" ON "CourseFeedbackResponse"("questionId", "enrollmentId");

-- CreateIndex
CREATE INDEX "AcademicEvent_startDate_idx" ON "AcademicEvent"("startDate");

-- CreateIndex
CREATE INDEX "AcademicEvent_visibility_idx" ON "AcademicEvent"("visibility");

-- CreateIndex
CREATE INDEX "AcademicEvent_type_idx" ON "AcademicEvent"("type");

-- AddForeignKey
ALTER TABLE "OTPCode" ADD CONSTRAINT "OTPCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRecord" ADD CONSTRAINT "StudentRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOffering" ADD CONSTRAINT "CourseOffering_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMeeting" ADD CONSTRAINT "CourseMeeting_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "CourseOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeReceipt" ADD CONSTRAINT "FeeReceipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeReceipt" ADD CONSTRAINT "FeeReceipt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackQuestion" ADD CONSTRAINT "FeedbackQuestion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedbackResponse" ADD CONSTRAINT "CourseFeedbackResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedbackResponse" ADD CONSTRAINT "CourseFeedbackResponse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseFeedbackResponse" ADD CONSTRAINT "CourseFeedbackResponse_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
