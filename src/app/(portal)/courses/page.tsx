'use client';

import { useState } from 'react';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  ltpsc: string; // Lecture-Tutorial-Practical-Self Study-Credits
  credits: number;
  status: 'enrolling' | 'ongoing' | 'completed';
  session: string;
  enrolments: number;
  department: string;
  slot: string;
  instructors: string[];
  isEnrolled: boolean;
}

export default function CoursesPage() {
  // Dummy data - will be replaced with database fetch later
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      courseCode: 'CS604',
      title: 'ADVANCED OPERATING SYSTEMS',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 12,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'Buffer slot',
      instructors: ['Nitin Auluck'],
      isEnrolled: false,
    },
    {
      id: '2',
      courseCode: 'CS502',
      title: 'DATA STRUCTURES AND ALGORITHMS',
      ltpsc: '3-1-0-6-4',
      credits: 4,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 45,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'A1',
      instructors: ['Dr. Rajesh Kumar', 'Dr. Priya Sharma'],
      isEnrolled: true,
    },
    {
      id: '3',
      courseCode: 'MA301',
      title: 'LINEAR ALGEBRA',
      ltpsc: '3-1-0-6-4',
      credits: 4,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 38,
      department: 'Dept. of Mathematics',
      slot: 'B2',
      instructors: ['Dr. Anita Verma'],
      isEnrolled: true,
    },
    {
      id: '4',
      courseCode: 'CS605',
      title: 'MACHINE LEARNING',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 67,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'C1',
      instructors: ['Dr. Amit Singh'],
      isEnrolled: false,
    },
    {
      id: '5',
      courseCode: 'EE401',
      title: 'DIGITAL SIGNAL PROCESSING',
      ltpsc: '3-0-2-4-4',
      credits: 4,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 29,
      department: 'Dept. of Electrical Engineering',
      slot: 'D1',
      instructors: ['Dr. Sunita Rani'],
      isEnrolled: false,
    },
    {
      id: '6',
      courseCode: 'CS701',
      title: 'DISTRIBUTED SYSTEMS',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'ongoing',
      session: '2025-I',
      enrolments: 34,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'A2',
      instructors: ['Dr. Vikram Mehta'],
      isEnrolled: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');

  // Filter courses based on search query and tab
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructors.some((instructor) =>
        instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab = activeTab === 'all' ? true : course.isEnrolled;

    return matchesSearch && matchesTab;
  });

  // Separate enrolled and available courses
  const enrolledCourses = filteredCourses.filter((course) => course.isEnrolled);
  const availableCourses = filteredCourses.filter((course) => !course.isEnrolled);

  // Handle enrollment toggle (will integrate with database later)
  const handleEnrollmentToggle = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              isEnrolled: !course.isEnrolled,
              enrolments: course.isEnrolled ? course.enrolments - 1 : course.enrolments + 1,
            }
          : course
      )
    );
  };

  const getStatusBadge = (status: Course['status']) => {
    const styles = {
      enrolling: 'bg-green-100 text-green-800 border-green-200',
      ongoing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    const labels = {
      enrolling: 'Enrolling',
      ongoing: 'Ongoing',
      completed: 'Completed',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900">
          <span className="text-indigo-900">{course.courseCode}</span> - {course.title}
        </h3>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1.5 text-xs">
        <div>
          <span className="text-slate-500">Credits:</span>
          <span className="ml-1 font-semibold text-slate-900">{course.credits}</span>
        </div>
        <div>
          <span className="text-slate-500">LTPSC:</span>
          <span className="ml-1 font-mono text-xs font-semibold text-slate-900">{course.ltpsc}</span>
        </div>
        <div>
          <span className="text-slate-500">Session:</span>
          <span className="ml-1 font-semibold text-slate-900">{course.session}</span>
        </div>
        <div>
          <span className="text-slate-500">Slot:</span>
          <span className="ml-1 font-semibold text-slate-900">{course.slot}</span>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2">
        <div>
          <div className="mb-0.5 text-xs font-medium text-slate-500">Department</div>
          <div className="text-xs text-slate-900">{course.department}</div>
        </div>

        <div>
          <div className="mb-0.5 text-xs font-medium text-slate-500">Instructor(s)</div>
          <div className="flex flex-wrap gap-1">
            {course.instructors.map((instructor, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
              >
                {instructor}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
        {getStatusBadge(course.status)}
        
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="font-medium">{course.enrolments}</span>
        </div>

        <button
          onClick={() => course.status === 'enrolling' && handleEnrollmentToggle(course.id)}
          disabled={course.status !== 'enrolling'}
          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
            course.status !== 'enrolling'
              ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
              : course.isEnrolled
              ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              : 'bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:from-indigo-800 hover:to-indigo-600'
          }`}
        >
          {course.isEnrolled ? 'Unenroll' : 'Enroll Now'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Course Catalog</h1>
            <p className="mt-2 text-indigo-100">Explore and enroll in courses for the current session</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">My Courses</div>
              <div className="text-2xl font-bold text-white">{enrolledCourses.length}</div>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Total Credits</div>
              <div className="text-2xl font-bold text-white">
                {enrolledCourses.reduce((sum, course) => sum + course.credits, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by course code, title, instructor, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={() => setActiveTab(activeTab === 'all' ? 'enrolled' : 'all')}
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition ${
              activeTab === 'enrolled'
                ? 'bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:from-indigo-800 hover:to-indigo-600'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Show Enrolled</span>
          </button>
        </div>
        
        {searchQuery && (
          <div className="mt-2 text-xs text-slate-500">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Enrolled Courses Section */}
      {activeTab === 'all' && enrolledCourses.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-indigo-600"></div>
            <h2 className="text-lg font-bold text-slate-900">My Enrolled Courses</h2>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-900">
              {enrolledCourses.length}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Available Courses Section */}
      {activeTab === 'all' && availableCourses.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-slate-400"></div>
            <h2 className="text-lg font-bold text-slate-900">Available Courses</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {availableCourses.length}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {availableCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Only Tab */}
      {activeTab === 'enrolled' && (
        <div className="grid gap-4 lg:grid-cols-3">
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course) => <CourseCard key={course.id} course={course} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="mt-2 text-sm font-medium text-slate-900">No enrolled courses</p>
              <p className="mt-1 text-sm text-slate-500">Start by enrolling in available courses</p>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-slate-900">No courses found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
}
