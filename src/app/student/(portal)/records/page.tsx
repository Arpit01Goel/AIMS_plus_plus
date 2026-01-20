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


export default function RecordsPage() {
  const [records, setRecords] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "minor" | "concentration">("main");

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/student/records');
        
        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }

        const data = await response.json();
        setRecords(data);
      } catch (err) {
        console.error("Failed to fetch student records:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
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

  if (error || !records) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900">
              {error ? 'Error loading records' : 'Failed to load records'}
            </p>
            {error && <p className="mt-2 text-sm text-slate-600">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (records.semesters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900">No academic records found</p>
            <p className="mt-2 text-sm text-slate-600">
              Your academic records will appear here once you enroll in courses.
            </p>
          </div>
        </div>
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
      {/* <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">NOTE:</span> Some of the grades shown here may be pending approval by the senate. The records confirmed by the academic section will take precedence over anything shown here.
            </p>
          </div>
        </div>
      </div> */}

      {/* Header with CGPA */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Academic Records
            </h1>
            <p className="mt-2 text-indigo-100">
              Complete academic history and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Cumulative GPA</div>
              <div className="text-2xl font-bold text-white">
                {records.cgpa.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Total Credits</div>
              <div className="text-2xl font-bold text-white">
                {records.totalCredits}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setActiveTab("main")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "main"
              ? "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-sm"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          Major
        </button>
        {minorProgram && (
          <button
            onClick={() => setActiveTab("minor")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "minor"
                ? "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Minor
          </button>
        )}
        {concentrationProgram && (
          <button
            onClick={() => setActiveTab("concentration")}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "concentration"
                ? "bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            Concentration
          </button>
        )}
      </div>

      {/* Grade Records */}
      <div className="space-y-6">
        {/* Program Title */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">{programTitle}</h2>
        </div>

        {/* Semester Records */}
        {displaySemesters.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-sm font-medium text-slate-600">No records available</p>
          </div>
        ) : (
          displaySemesters.map((semester, semIndex) => (
            <div
              key={semIndex}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Semester Header */}
              <div className={`border-b border-slate-200 px-6 py-4 ${
                semester.isCurrent 
                  ? "bg-gradient-to-r from-indigo-900 to-indigo-700" 
                  : "bg-slate-200"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-xl font-bold ${
                        semester.isCurrent ? "text-white" : "text-black"
                      }`}>
                        {semester.semesterCode}
                      </h2>
                      {semester.isCurrent && (
                        <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-indigo-900">
                          Current
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm ${
                      semester.isCurrent ? "text-indigo-100" : "text-black/90"
                    }`}>
                      {semester.semesterName}
                    </p>
                  </div>
                  {semester.isCurrent && (
                    <div className="flex gap-3">
                      <div className="rounded-lg bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
                        <p className="text-xs text-white/90">CGPA</p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {semester.cgpa.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
                        <p className="text-xs text-white/90">Credits</p>
                        <p className="mt-1 text-xl font-bold text-white">
                          {semester.totalCredits}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        S#
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Course
                      </th>
                      <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Enrol.
                      </th>
                      <th className="w-40 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Enrol. Status
                      </th>
                      <th className="w-32 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Course Cat.
                      </th>
                      <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Grade
                      </th>
                      <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Attd.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.courses.map((course, courseIndex) => (
                      <tr
                        key={courseIndex}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-center text-sm text-slate-600">
                          {courseIndex + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {course.courseCode}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              {course.courseName}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-medium text-slate-700">
                            Credit
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {course.enrollmentStatus ? (
                            <span className="text-xs font-medium text-slate-700">
                              {getEnrollmentStatusText(course.enrollmentStatus)}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-700">
                              Enrolled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-medium text-slate-700">
                            {course.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {course.grade === "" ? (
                            <span className="text-sm text-slate-400">-</span>
                          ) : (
                            <span className="text-sm font-semibold text-slate-900">
                              {course.grade}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {course.attendance > 0 ? (
                            <span className="text-sm text-slate-900">
                              {course.attendance}%
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Semester Summary Footer */}
              {!semester.isCurrent && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-slate-600">Credits Registered</p>
                        <p className="text-lg font-semibold text-slate-900">{semester.totalCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Earned Credits</p>
                        <p className="text-lg font-semibold text-slate-900">{semester.earnedCredits}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Cumul. Earned Credits</p>
                        <p className="text-lg font-semibold text-slate-900">{semester.earnedCredits}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Semester Performance</p>
                      <p className="text-lg font-semibold text-slate-900">
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
