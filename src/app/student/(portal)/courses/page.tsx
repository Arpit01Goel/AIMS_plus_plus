'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  ltpsc: string; 
  credits: number;
  status: 'enrolling' | 'running' | 'completed';
  session: string;
  enrolments: number;
  department: string;
  slot: string;
  instructors: string[];
  isEnrolled: boolean;
  enrollmentStatus?: string;
  enrollmentType?: string;
  grade?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [actionsModalOpen, setActionsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses from API
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await fetch('/api/courses/student');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.courses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Get unique departments for filter
  const departments = Array.from(new Set(courses.map(c => c.department))).sort();

  // Filter courses based on search query, tab, and department
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructors.some((instructor) =>
        instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTab = activeTab === 'all' ? true : course.isEnrolled;
    const matchesDepartment = selectedDepartment === 'all' ? true : course.department === selectedDepartment;

    return matchesSearch && matchesTab && matchesDepartment;
  });

  // Separate enrolled and available courses
  const enrolledCourses = filteredCourses.filter((course) => course.isEnrolled);
  const availableCourses = filteredCourses.filter((course) => !course.isEnrolled);

  // Handle enrollment with type
  const handleEnroll = async (courseId: string, enrollmentType: 'CREDIT' | 'AUDIT' | 'CREDIT_MINOR' | 'CREDIT_CONCENTRATION') => {
    try {
      const response = await fetch('/api/courses/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: courseId,
          enrollmentType: enrollmentType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to enroll in course');
        return;
      }

      setEnrollModalOpen(false);
      setSelectedCourse(null);

      // Show success message
      alert(`Successfully requested enrollment as ${enrollmentType}. Status: ${data.enrollment.status}`);

      // Refresh courses list
      const coursesResponse = await fetch('/api/courses/student');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses);
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      alert('An error occurred while enrolling. Please try again.');
    }
  };

  // Handle enrollment actions
  const handleAction = async (courseId: string, action: 'DROP' | 'WITHDRAW' | 'AUDIT') => {
    // Confirm action
    const confirmMessage = 
      action === 'DROP' 
        ? 'Are you sure you want to drop this course?' 
        : action === 'WITHDRAW'
        ? 'Are you sure you want to withdraw from this course? This will appear on your transcript.'
        : 'Are you sure you want to convert this enrollment to audit?';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/courses/student/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeringId: courseId,
          action: action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to perform action');
        return;
      }

      setActionsModalOpen(false);
      setSelectedCourse(null);

      // Show success message
      alert(data.message);

      // Refresh courses list
      const coursesResponse = await fetch('/api/courses/student');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses);
      }
    } catch (err) {
      console.error('Error performing action:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const getStatusBadge = (status: Course['status']) => {
    const styles = {
      enrolling: 'bg-green-100 text-green-800 border-green-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    const labels = {
      enrolling: 'Enrolling',
      running: 'Running',
      completed: 'Completed',
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
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

        {course.isEnrolled? (
          /* Actions Button - Enabled only for ENROLLED status */
          <button
            onClick={() => {
              setSelectedCourse(course);
              setActionsModalOpen(true);
            }}
            disabled={course.enrollmentStatus !== 'ENROLLED'}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
              course.enrollmentStatus !== 'ENROLLED'
                ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Actions
          </button>
        ) : (
          /* Enroll Button - Disabled if course is not enrolling */
          <button
            onClick={() => {
              setSelectedCourse(course);
              setEnrollModalOpen(true);
            }}
            disabled={course.status !== 'enrolling'}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
              course.status !== 'enrolling'
                ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                : 'bg-gradient-to-r from-indigo-900 to-indigo-700 text-white hover:from-indigo-800 hover:to-indigo-600'
            }`}
          >
            Enroll
          </button>
        )}
      </div>

      {/* Enrollment Status Section - Only for enrolled courses */}
      {course.isEnrolled && (
        <div className="border-t border-slate-100 pt-2 mt-2 space-y-1.5">
          {/* Enrollment Type Row */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-600">Enrollment Type:</span>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
              {course.enrollmentType?.replace('CREDIT_', '').replace('_', ' ') || 'CREDIT'}
            </span>
          </div>

          {/* Enrollment Status Row */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-600">Status:</span>
            <span className="rounded-md px-2 py-0.5 font-semibold text-slate-900">
              {course.enrollmentStatus?.replace(/_/g, ' ') || 'ENROLLED'}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-4 text-sm font-medium text-slate-700">Loading courses...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Courses</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
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
          
          {/* Department Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="min-w-[200px] appearance-none rounded-lg border-2 border-slate-300 bg-white px-5 py-3 pr-12 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {/* Custom Dropdown Arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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

      {/* Enrollment Type Modal */}
      {enrollModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Enrollment Type</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedCourse.courseCode} - {selectedCourse.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEnrollModalOpen(false);
                    setSelectedCourse(null);
                  }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => selectedCourse && handleEnroll(selectedCourse.id, 'CREDIT')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Credit</div>
                  <div className="mt-1 text-sm text-slate-600">Enroll for academic credit</div>
                </button>

                <button
                  onClick={() => selectedCourse && handleEnroll(selectedCourse.id, 'AUDIT')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Audit</div>
                  <div className="mt-1 text-sm text-slate-600">Attend without receiving credit</div>
                </button>

                <button
                  onClick={() => selectedCourse && handleEnroll(selectedCourse.id, 'CREDIT_MINOR')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Credit for Minor</div>
                  <div className="mt-1 text-sm text-slate-600">Count towards minor program requirements</div>
                </button>

                <button
                  onClick={() => selectedCourse && handleEnroll(selectedCourse.id, 'CREDIT_CONCENTRATION')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Credit for Concentration</div>
                  <div className="mt-1 text-sm text-slate-600">Count towards concentration requirements</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {actionsModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Course Actions</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedCourse.courseCode} - {selectedCourse.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActionsModalOpen(false);
                    setSelectedCourse(null);
                  }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => selectedCourse && handleAction(selectedCourse.id, 'DROP')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Drop Course</div>
                  <div className="mt-1 text-sm text-slate-600">Remove enrollment from this course</div>
                </button>

                <button
                  onClick={() => selectedCourse && handleAction(selectedCourse.id, 'WITHDRAW')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Withdraw</div>
                  <div className="mt-1 text-sm text-slate-600">Withdraw from course (appears on transcript)</div>
                </button>

                <button
                  onClick={() => selectedCourse && handleAction(selectedCourse.id, 'AUDIT')}
                  className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-50"
                >
                  <div className="font-semibold text-slate-900">Convert to Audit</div>
                  <div className="mt-1 text-sm text-slate-600">Change enrollment type to audit</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
