"use client";

import { useState, useEffect } from "react";

type Grade = "A" | "A-" | "B" | "B-" | "C" | "C-" | "D" | "F" | "I" | "P" | "W" | "";

type CourseCategory = "SC" | "GR" | "HC" | "NN" | "PC" | "FC";

type EnrollmentStatus = "pending-instructor" | "pending-advisor" | "enrolled" | "dropped";

type CourseGrade = {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: Grade;
  gradePoints: number;
  category: CourseCategory;
  attendance: number;
  enrollmentStatus?: EnrollmentStatus;
};

type SemesterRecord = {
  semesterCode: string; // Format: "2025-I", "2025-II", "2025-S"
  semesterName: string; // Format: "July-Dec 2025", "Jan-May 2026", "May-July 2026"
  courses: CourseGrade[];
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  isCurrent: boolean;
};

type DegreeProgram = {
  type: "Minor" | "Concentration";
  department: string;
  semesters: SemesterRecord[];
};

type StudentRecord = {
  semesters: SemesterRecord[];
  cgpa: number;
  totalCredits: number;
  degreePrograms: DegreeProgram[];
};

// TODO: Replace with API call to fetch student records
// Example: GET /api/student/records
const fetchStudentRecords = async (): Promise<StudentRecord> => {
  // Simulate API call with dummy data matching AIMS format
  return Promise.resolve({
    cgpa: 8.17,
    totalCredits: 54.5,
    semesters: [
      {
        semesterCode: "2026-II",
        semesterName: "Jan-May 2026",
        sgpa: 0,
        cgpa: 8.17,
        totalCredits: 12,
        earnedCredits: 0,
        isCurrent: true,
        courses: [
          { courseCode: "CS201", courseName: "Data Structures and Algorithms", credits: 4, grade: "", gradePoints: 0, category: "PC", attendance: 0, enrollmentStatus: "enrolled" },
          { courseCode: "CS202", courseName: "Computer Organization", credits: 3, grade: "", gradePoints: 0, category: "PC", attendance: 0, enrollmentStatus: "pending-advisor" },
          { courseCode: "MA201", courseName: "Probability and Statistics", credits: 3, grade: "", gradePoints: 0, category: "SC", attendance: 0, enrollmentStatus: "pending-instructor" },
          { courseCode: "HS201", courseName: "Economics", credits: 2, grade: "", gradePoints: 0, category: "HC", attendance: 0, enrollmentStatus: "dropped" },
        ],
      },
      {
        semesterCode: "2023-I",
        semesterName: "July-Dec 2023",
        sgpa: 8.17,
        cgpa: 8.17,
        totalCredits: 18,
        earnedCredits: 18,
        isCurrent: false,
        courses: [
          { courseCode: "MA101", courseName: "CALCULUS (3-1-0-5-3)", credits: 3, grade: "A-", gradePoints: 9, category: "SC", attendance: 95 },
          { courseCode: "CY101", courseName: "CHEMISTRY FOR ENGINEERS (3-1-2-6-4)", credits: 4, grade: "B", gradePoints: 8, category: "SC", attendance: 92 },
          { courseCode: "GE103", courseName: "INTRODUCTION TO COMPUTING AND DATA STRUCTURES (3-0-3-1.5/2-4.5)", credits: 4.5, grade: "A-", gradePoints: 9, category: "GR", attendance: 98 },
          { courseCode: "HS103", courseName: "PROFESSIONAL ENGLISH COMMUNICATION (2-0-2-5-3)", credits: 3, grade: "C", gradePoints: 7, category: "HC", attendance: 88 },
          { courseCode: "NO101", courseName: "NSO I (0-0-2-1-1)", credits: 1, grade: "A", gradePoints: 10, category: "NN", attendance: 100 },
          { courseCode: "GE105", courseName: "ENGINEERING DRAWING (0-0-3-3/2-1.5)", credits: 1.5, grade: "B-", gradePoints: 8, category: "GR", attendance: 90 },
          { courseCode: "GE101", courseName: "TECHNOLOGY MUSEUM LAB (0-0-2-1-1)", credits: 1, grade: "A-", gradePoints: 9, category: "GR", attendance: 100 },
        ],
      },
      {
        semesterCode: "2023-II",
        semesterName: "Jan-May 2024",
        sgpa: 7.78,
        cgpa: 7.97,
        totalCredits: 18.5,
        earnedCredits: 18.5,
        isCurrent: false,
        courses: [
          { courseCode: "CS101", courseName: "DISCRETE MATHEMATICAL STRUCTURES (3-1-0-5-3)", credits: 3, grade: "A", gradePoints: 10, category: "PC", attendance: 96 },
          { courseCode: "HS101", courseName: "HISTORY OF TECHNOLOGY (3/2-1/2-0-5/2-1.5)", credits: 1.5, grade: "B", gradePoints: 8, category: "HC", attendance: 89 },
          { courseCode: "PH101", courseName: "Physics for Engineers (3-1-0-5-3)", credits: 3, grade: "B-", gradePoints: 7, category: "SC", attendance: 91 },
          { courseCode: "PH102", courseName: "Physics for Engineers Lab (0-0-4-2-2)", credits: 2, grade: "B", gradePoints: 8, category: "SC", attendance: 94 },
          { courseCode: "MA102", courseName: "LINEAR ALGEBRA, INTEGRAL TRANSFORMS AND SPECIAL FUNCTIONS (3-1-0-5-3)", credits: 3, grade: "B", gradePoints: 8, category: "SC", attendance: 87 },
          { courseCode: "GE104", courseName: "INTRODUCTION TO ELECTRICAL ENGINEERING (2-2/3-2-13/3-3)", credits: 3, grade: "C", gradePoints: 7, category: "GR", attendance: 85 },
          { courseCode: "GE102", courseName: "WORKSHOP PRACTICE (0-0-4-2-2)", credits: 2, grade: "B", gradePoints: 8, category: "GR", attendance: 93 },
          { courseCode: "NO102", courseName: "NSO II (0-0-2-1-1)", credits: 1, grade: "A", gradePoints: 10, category: "NN", attendance: 100 },
        ],
      },
    ],
    degreePrograms: [
      {
        type: "Minor",
        department: "Mathematics",
        semesters: [
          {
            semesterCode: "2023-I",
            semesterName: "July-Dec 2023",
            sgpa: 8.5,
            cgpa: 8.5,
            totalCredits: 6,
            earnedCredits: 6,
            isCurrent: false,
            courses: [
              { courseCode: "MA201", courseName: "Advanced Calculus", credits: 3, grade: "A", gradePoints: 10, category: "SC", attendance: 96 },
              { courseCode: "MA202", courseName: "Abstract Algebra", credits: 3, grade: "B", gradePoints: 8, category: "SC", attendance: 92 },
            ],
          },
          {
            semesterCode: "2023-II",
            semesterName: "Jan-May 2024",
            sgpa: 8.0,
            cgpa: 8.25,
            totalCredits: 9,
            earnedCredits: 9,
            isCurrent: false,
            courses: [
              { courseCode: "MA301", courseName: "Real Analysis", credits: 3, grade: "A-", gradePoints: 9, category: "SC", attendance: 94 },
              { courseCode: "MA302", courseName: "Complex Analysis", credits: 3, grade: "B", gradePoints: 8, category: "SC", attendance: 90 },
              { courseCode: "MA303", courseName: "Topology", credits: 3, grade: "B", gradePoints: 8, category: "SC", attendance: 88 },
            ],
          },
        ],
      },
      {
        type: "Concentration",
        department: "Artificial Intelligence",
        semesters: [
          {
            semesterCode: "2024-I",
            semesterName: "July-Dec 2024",
            sgpa: 8.7,
            cgpa: 8.7,
            totalCredits: 9,
            earnedCredits: 9,
            isCurrent: false,
            courses: [
              { courseCode: "CS401", courseName: "Machine Learning", credits: 3, grade: "A", gradePoints: 10, category: "PC", attendance: 98 },
              { courseCode: "CS402", courseName: "Deep Learning", credits: 3, grade: "A-", gradePoints: 9, category: "PC", attendance: 95 },
              { courseCode: "CS403", courseName: "Natural Language Processing", credits: 3, grade: "B", gradePoints: 8, category: "PC", attendance: 90 },
            ],
          },
        ],
      },
    ],
  });
};

const getCategoryColor = (category: CourseCategory) => {
  switch (category) {
    case "SC":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "GR":
      return "bg-purple-100 text-purple-700 border-purple-300";
    case "HC":
      return "bg-pink-100 text-pink-700 border-pink-300";
    case "NN":
      return "bg-gray-100 text-gray-700 border-gray-300";
    case "PC":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "FC":
      return "bg-orange-100 text-orange-700 border-orange-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300";
  }
};

const getEnrollmentStatusColor = (status: EnrollmentStatus) => {
  switch (status) {
    case "enrolled":
      return "bg-emerald-100 text-emerald-700";
    case "pending-instructor":
      return "bg-amber-100 text-amber-700";
    case "pending-advisor":
      return "bg-orange-100 text-orange-700";
    case "dropped":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getEnrollmentStatusText = (status: EnrollmentStatus) => {
  switch (status) {
    case "enrolled":
      return "Enrolled";
    case "pending-instructor":
      return "Pending Instructor";
    case "pending-advisor":
      return "Pending Advisor";
    case "dropped":
      return "Dropped";
    default:
      return status;
  }
};

const getGradeColor = (grade: Grade) => {
  if (grade === "A") return "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200";
  if (grade === "A-") return "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-100";
  if (grade === "B") return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200";
  if (grade === "B-") return "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200";
  if (grade === "C") return "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-200";
  if (grade === "C-") return "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200";
  if (["D", "F"].includes(grade)) return "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-200";
  if (grade === "P") return "bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-lg shadow-teal-100";
  if (grade === "") return "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-100";
  return "bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-100";
};

const getAttendanceColor = (attendance: number) => {
  if (attendance >= 95) return "text-emerald-600 font-bold";
  if (attendance >= 90) return "text-green-600 font-semibold";
  if (attendance >= 85) return "text-blue-600 font-medium";
  if (attendance >= 75) return "text-amber-600 font-medium";
  return "text-rose-600 font-bold";
};

export default function RecordsPage() {
  const [records, setRecords] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"main" | "minor" | "concentration">("main");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await fetchStudentRecords();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch student records:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRecords();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm text-slate-600">Loading records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!records) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-center text-slate-600">Failed to load records</p>
      </div>
    );
  }

  // Sort semesters by semester code (most recent first)
  const sortedSemesters = [...records.semesters].sort((a, b) => {
    return b.semesterCode.localeCompare(a.semesterCode);
  });

  // Get degree program data
  const minorProgram = records.degreePrograms.find(p => p.type === "Minor");
  const concentrationProgram = records.degreePrograms.find(p => p.type === "Concentration");

  // Determine which semesters to show based on active tab
  let displaySemesters: SemesterRecord[] = [];
  let programTitle = "";
  
  if (activeTab === "main") {
    displaySemesters = sortedSemesters;
    programTitle = "Main Program - Academic Records";
  } else if (activeTab === "minor" && minorProgram) {
    displaySemesters = [...minorProgram.semesters].sort((a, b) => 
      b.semesterCode.localeCompare(a.semesterCode)
    );
    programTitle = `Minor in ${minorProgram.department}`;
  } else if (activeTab === "concentration" && concentrationProgram) {
    displaySemesters = [...concentrationProgram.semesters].sort((a, b) => 
      b.semesterCode.localeCompare(a.semesterCode)
    );
    programTitle = `Concentration in ${concentrationProgram.department}`;
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="rounded-xl border-l-4 border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-900">
              <span className="font-bold">NOTE:</span> Some of the grades shown here may be pending approval by the senate. The records confirmed by the academic section will take precedence over anything shown here.
            </p>
          </div>
        </div>
      </div>

      {/* Header with CGPA */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 shadow-2xl shadow-purple-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                Academic Performance
              </span>
              <span className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                {records.totalCredits} Credits
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg">
              Student Academic Records
            </h1>
            <p className="mt-2 text-sm font-medium text-white/90">
              Complete academic history and performance metrics
            </p>
          </div>
          <div className="text-right">
            <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">Cumulative GPA</p>
              <p className="mt-2 bg-gradient-to-br from-yellow-300 to-amber-400 bg-clip-text text-6xl font-black text-transparent drop-shadow-2xl">
                {records.cgpa.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 rounded-2xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-2 shadow-lg">
        <button
          onClick={() => setActiveTab("main")}
          className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
            activeTab === "main"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300"
              : "text-slate-600 hover:bg-white/50"
          }`}
        >
          Main Program
        </button>
        {minorProgram && (
          <button
            onClick={() => setActiveTab("minor")}
            className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === "minor"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            Minor
          </button>
        )}
        {concentrationProgram && (
          <button
            onClick={() => setActiveTab("concentration")}
            className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
              activeTab === "concentration"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-300"
                : "text-slate-600 hover:bg-white/50"
            }`}
          >
            Concentration
          </button>
        )}
      </div>

      {/* Grade Records */}
      <div className="space-y-6">
        {/* Program Title */}
        <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-white via-purple-50 to-pink-50 p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-purple-900">{programTitle}</h2>
        </div>

        {/* Semester Records */}
        {displaySemesters.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <p className="text-lg font-medium text-slate-500">No records available</p>
          </div>
        ) : (
          displaySemesters.map((semester, semIndex) => (
            <div
              key={semIndex}
              className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl"
            >
              {/* Semester Header */}
              <div className={`border-b-2 border-slate-200 px-6 py-5 ${
                semester.isCurrent 
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" 
                  : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black uppercase tracking-wide text-white drop-shadow-lg">
                          {semester.semesterCode}
                        </h2>
                        {semester.isCurrent && (
                          <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600 shadow-lg">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white/90">
                        Academic Session: {semester.semesterName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {!semester.isCurrent && (
                      <div className="rounded-xl bg-white/10 px-5 py-3 text-center backdrop-blur-md">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">SGPA</p>
                        <p className="mt-1 text-3xl font-black text-yellow-300 drop-shadow-lg">
                          {semester.sgpa.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="rounded-xl bg-white/10 px-5 py-3 text-center backdrop-blur-md">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/80">CGPA</p>
                      <p className="mt-1 text-3xl font-black text-emerald-300 drop-shadow-lg">
                        {semester.cgpa.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-5 py-3 text-center backdrop-blur-md">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/80">Credits</p>
                      <p className="mt-1 text-3xl font-black text-cyan-300 drop-shadow-lg">
                        {semester.isCurrent ? semester.totalCredits : semester.earnedCredits}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                      <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-700">
                        S#
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-wider text-slate-700">
                        Course
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-700">
                        Enrol.
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-700">
                        Enrol. Status
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-700">
                        Course Cat.
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-700">
                        Grade
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-wider text-slate-700">
                        Attd.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.courses.map((course, courseIndex) => (
                      <tr
                        key={courseIndex}
                        className="group border-b border-slate-100 transition-colors hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                      >
                        <td className="px-4 py-4 text-center font-bold text-slate-600">
                          {courseIndex + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-mono text-sm font-bold text-indigo-600">
                              {course.courseCode}
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-700">
                              {course.courseName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-700">
                            Credit
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {course.enrollmentStatus ? (
                            <span className={`inline-block rounded-lg px-3 py-1.5 text-sm font-bold ${getEnrollmentStatusColor(course.enrollmentStatus)}`}>
                              {getEnrollmentStatusText(course.enrollmentStatus)}
                            </span>
                          ) : (
                            <span className="inline-block rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700">
                              Enrolled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block rounded-lg border-2 px-3 py-1.5 text-xs font-bold ${getCategoryColor(course.category)}`}>
                            {course.category}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {course.grade === "" ? (
                            <span className="text-sm font-medium text-slate-400">-</span>
                          ) : (
                            <span
                              className={`inline-block rounded-xl px-4 py-2 text-lg font-black ${getGradeColor(
                                course.grade
                              )}`}
                            >
                              {course.grade}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {course.attendance > 0 ? (
                            <span className={`text-lg ${getAttendanceColor(course.attendance)}`}>
                              {course.attendance}%
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Semester Summary Footer */}
              {!semester.isCurrent && (
                <div className="border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Credits Registered</p>
                        <p className="text-xl font-bold text-indigo-600">{semester.totalCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Earned Credits</p>
                        <p className="text-xl font-bold text-emerald-600">{semester.earnedCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">Cumul. Earned Credits</p>
                        <p className="text-xl font-bold text-purple-600">{semester.earnedCredits}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500">Semester Performance</p>
                      <p className="text-2xl font-black text-indigo-600">
                        SGPA: {semester.sgpa.toFixed(2)} | CGPA: {semester.cgpa.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
