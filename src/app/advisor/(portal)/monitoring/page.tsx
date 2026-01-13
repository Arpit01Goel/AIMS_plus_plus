'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown, BookOpen, Award, Clock, AlertTriangle } from 'lucide-react';

interface Student {
  id: string;
  orgId: string;
  name: string;
  cgpa: number;
  creditsEarned: number;
  currentEnrollments: number;
}

interface EnrollmentRecord {
  courseCode: string;
  courseTitle: string;
  session: string;
  credits: number;
  grade: string;
  sgpa: number;
}

interface CreditBreakdown {
  category: string;
  earned: number;
  required: number;
  percentage: number;
}

export default function StudentMonitoringPage() {
  const [students] = useState<Student[]>([
    { id: '1', orgId: '2021CS001', name: 'Rahul Verma', cgpa: 3.85, creditsEarned: 48, currentEnrollments: 5 },
    { id: '2', orgId: '2021CS015', name: 'Priya Sharma', cgpa: 3.92, creditsEarned: 52, currentEnrollments: 4 },
    { id: '3', orgId: '2021CS022', name: 'Amit Kumar', cgpa: 3.68, creditsEarned: 44, currentEnrollments: 6 },
    { id: '4', orgId: '2021CS034', name: 'Sneha Patel', cgpa: 4.0, creditsEarned: 56, currentEnrollments: 4 },
    { id: '5', orgId: '2021CS047', name: 'Vikram Singh', cgpa: 3.55, creditsEarned: 40, currentEnrollments: 5 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    current: true,
    history: true,
    performance: true,
    credits: true,
  });

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.orgId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sample data for selected student
  const currentEnrollments: EnrollmentRecord[] = [
    { courseCode: 'CS701', courseTitle: 'Advanced Algorithms', session: '2025-II', credits: 4, grade: '-', sgpa: 0 },
    { courseCode: 'CS702', courseTitle: 'Database Systems', session: '2025-II', credits: 3, grade: '-', sgpa: 0 },
    { courseCode: 'CS703', courseTitle: 'Computer Networks', session: '2025-II', credits: 4, grade: '-', sgpa: 0 },
    { courseCode: 'CS704', courseTitle: 'Operating Systems', session: '2025-II', credits: 3, grade: '-', sgpa: 0 },
    { courseCode: 'HS101', courseTitle: 'Technical Writing', session: '2025-II', credits: 2, grade: '-', sgpa: 0 },
  ];

  const enrollmentHistory: EnrollmentRecord[] = [
    { courseCode: 'CS501', courseTitle: 'Data Structures', session: '2024-II', credits: 4, grade: 'A', sgpa: 9.0 },
    { courseCode: 'CS502', courseTitle: 'Algorithms', session: '2024-II', credits: 4, grade: 'A', sgpa: 9.0 },
    { courseCode: 'MA101', courseTitle: 'Calculus', session: '2024-II', credits: 3, grade: 'B+', sgpa: 8.5 },
    { courseCode: 'CS503', courseTitle: 'Programming', session: '2024-I', credits: 3, grade: 'A+', sgpa: 10.0 },
    { courseCode: 'CS504', courseTitle: 'Discrete Math', session: '2024-I', credits: 4, grade: 'A', sgpa: 9.0 },
  ];

  const semesterPerformance = [
    { semester: '2024-I', sgpa: 9.2, credits: 20 },
    { semester: '2024-II', sgpa: 8.8, credits: 22 },
    { semester: '2025-I', sgpa: 9.0, credits: 20 },
  ];

  const creditBreakdown: CreditBreakdown[] = [
    { category: 'Core Courses', earned: 32, required: 40, percentage: 80 },
    { category: 'Electives', earned: 12, required: 20, percentage: 60 },
    { category: 'Humanities', earned: 4, required: 6, percentage: 67 },
    { category: 'Lab Courses', earned: 8, required: 12, percentage: 67 },
  ];

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-700 bg-green-100';
    if (grade === 'B+' || grade === 'B') return 'text-blue-700 bg-blue-100';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-700 bg-yellow-100';
    if (grade === 'D' || grade === 'F') return 'text-red-700 bg-red-100';
    return 'text-slate-700 bg-slate-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Academic Monitoring
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Student Monitoring
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            View comprehensive academic records and performance of your batch students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900">Batch Students</h2>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-4 max-h-[600px] space-y-2 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedStudent?.id === student.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <h3 className="font-bold text-slate-900">{student.name}</h3>
                <p className="mt-1 text-xs font-medium text-slate-600">{student.orgId}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-700">CGPA: {student.cgpa.toFixed(2)}</span>
                  <span className="text-slate-600">{student.creditsEarned} credits</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Details */}
        <div className="space-y-6 lg:col-span-2">
          {selectedStudent ? (
            <>
              {/* Student Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
                    <p className="mt-1 text-sm font-medium text-slate-600">{selectedStudent.orgId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-indigo-700">{selectedStudent.cgpa.toFixed(2)}</p>
                    <p className="text-xs font-medium text-slate-600">CGPA</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedStudent.creditsEarned}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Credits Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.currentEnrollments}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Current Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">16</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Credits Enrolled</p>
                  </div>
                </div>
              </div>

              {/* Current Enrollments */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  onClick={() => toggleSection('current')}
                  className="flex w-full items-center justify-between"
                >
                  <h3 className="text-lg font-bold text-slate-900">Current Enrollments (2025-II)</h3>
                  {expandedSections.current ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedSections.current && (
                  <div className="mt-4 space-y-2">
                    {currentEnrollments.map((course, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900">{course.courseCode}</h4>
                            <p className="mt-1 text-sm text-slate-600">{course.courseTitle}</p>
                          </div>
                          <div className="text-right">
                            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                              {course.credits} credits
                            </span>
                            <p className="mt-1 text-xs text-slate-600">In Progress</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrollment History */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  onClick={() => toggleSection('history')}
                  className="flex w-full items-center justify-between"
                >
                  <h3 className="text-lg font-bold text-slate-900">Enrollment History</h3>
                  {expandedSections.history ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedSections.history && (
                  <div className="mt-4 space-y-2">
                    {enrollmentHistory.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900">{course.courseCode}</h4>
                          <p className="mt-1 text-sm text-slate-600">{course.courseTitle}</p>
                          <p className="mt-1 text-xs text-slate-500">{course.session}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600">
                            {course.credits} credits
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${getGradeColor(
                              course.grade
                            )}`}
                          >
                            {course.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Semester Performance */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  onClick={() => toggleSection('performance')}
                  className="flex w-full items-center justify-between"
                >
                  <h3 className="text-lg font-bold text-slate-900">Semester Performance Trends</h3>
                  {expandedSections.performance ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedSections.performance && (
                  <div className="mt-4 space-y-3">
                    {semesterPerformance.map((sem, index) => {
                      const prevSGPA = index > 0 ? semesterPerformance[index - 1].sgpa : sem.sgpa;
                      const trend = sem.sgpa > prevSGPA ? 'up' : sem.sgpa < prevSGPA ? 'down' : 'same';

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div>
                            <h4 className="font-bold text-slate-900">{sem.semester}</h4>
                            <p className="mt-1 text-xs text-slate-600">{sem.credits} credits</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">
                              {sem.sgpa.toFixed(2)}
                            </span>
                            {trend === 'up' && (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            )}
                            {trend === 'down' && (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Credit Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <button
                  onClick={() => toggleSection('credits')}
                  className="flex w-full items-center justify-between"
                >
                  <h3 className="text-lg font-bold text-slate-900">Credit Category Analysis</h3>
                  {expandedSections.credits ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>

                {expandedSections.credits && (
                  <div className="mt-4 space-y-4">
                    {creditBreakdown.map((category, index) => (
                      <div key={index}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">
                            {category.category}
                          </span>
                          <span className="text-sm font-medium text-slate-600">
                            {category.earned} / {category.required} credits
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full transition-all ${
                              category.percentage >= 100
                                ? 'bg-green-600'
                                : category.percentage >= 70
                                ? 'bg-blue-600'
                                : 'bg-yellow-600'
                            }`}
                            style={{ width: `${Math.min(category.percentage, 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{category.percentage}% complete</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
              <div className="text-center">
                <BookOpen className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Select a student to view their academic records
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
