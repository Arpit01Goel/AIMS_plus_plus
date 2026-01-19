'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Clock, ChevronRight, Search, Filter, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  title: string;
  ltpsc: string;
  credits: number;
  category: string;
  status: string;
  session: string;
  students: number;
  capacity: number;
  slot: string;
  section?: string;
  pendingApprovals?: number;
}

// Card Component
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'enrolling' | 'completed'>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/courses');
      const json = await res.json();
      
      console.log('API Response:', { status: res.status, ok: res.ok, data: json });

      if (!res.ok) throw new Error(json.error || 'Failed to load courses');

      console.log('Setting courses:', json.courses?.length || 0, 'courses');
      setCourses(json.courses || []);
      setError(null);
    } catch (err) {
      console.error('Load courses error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error loading courses</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
        <button
          onClick={loadCourses}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retry
        </button>
      </Card>
    );
  }

  console.log('Courses state:', courses.length, 'courses');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const statusLower = course.status?.toLowerCase() || 'enrolling';
    const matchesStatus = statusFilter === 'all' || 
                         statusLower === statusFilter ||
                         (statusFilter === 'ongoing' && statusLower === 'running');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Course['status']) => {
    const statusLower = status?.toLowerCase() || 'enrolling';
    const styles: Record<string, string> = {
      enrolling: 'bg-green-100 text-green-800 border-green-200',
      ongoing: 'bg-blue-100 text-blue-800 border-blue-200',
      running: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    const labels: Record<string, string> = {
      enrolling: 'Enrolling',
      ongoing: 'Ongoing',
      running: 'Running',
      completed: 'Completed',
    };
    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[statusLower] || styles.enrolling}`}>
        {labels[statusLower] || statusLower}
      </span>
    );
  };

  const ongoingCourses = filteredCourses.filter((c) => c.status?.toLowerCase() === 'ongoing' || c.status?.toLowerCase() === 'running');
  const enrollingCourses = filteredCourses.filter((c) => c.status?.toLowerCase() === 'enrolling');
  const completedCourses = filteredCourses.filter((c) => c.status?.toLowerCase() === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Course Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My Courses</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              View and manage all courses you&apos;re teaching this semester
            </p>
          </div>
          <Link
            href="/instructor/create-course"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + Float New Course
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Courses</option>
              <option value="ongoing">Ongoing</option>
              <option value="enrolling">Enrolling</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{ongoingCourses.length}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Ongoing Courses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{enrollingCourses.length}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Enrolling</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">
              {filteredCourses.reduce((sum, c) => sum + c.students, 0)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Students</p>
          </div>
        </div>
      </div>

      {/* Ongoing Courses */}
      {ongoingCourses.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-slate-900">Ongoing Courses</h2>
          <div className="mt-4 space-y-3">
            {ongoingCourses.map((course) => (
              <CourseCard key={course.id} course={course} getStatusBadge={getStatusBadge} />
            ))}
          </div>
        </Card>
      )}

      {/* Enrolling Courses */}
      {enrollingCourses.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-slate-900">Enrolling Courses</h2>
          <div className="mt-4 space-y-3">
            {enrollingCourses.map((course) => (
              <CourseCard key={course.id} course={course} getStatusBadge={getStatusBadge} />
            ))}
          </div>
        </Card>
      )}

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-slate-900">Completed Courses</h2>
          <div className="mt-4 space-y-3">
            {completedCourses.map((course) => (
              <CourseCard key={course.id} course={course} getStatusBadge={getStatusBadge} />
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <Card className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No courses found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try adjusting your search or filters, or float a new course.
          </p>
        </Card>
      )}
    </div>
  );
}

function CourseCard({
  course,
  getStatusBadge,
}: {
  course: Course;
  getStatusBadge: (status: Course['status']) => React.ReactElement;
}) {
  const enrollmentPercentage = (course.students / course.capacity) * 100;

  return (
    <div className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 group-hover:bg-indigo-200">
            <BookOpen className="h-7 w-7 text-indigo-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{course.code}</h3>
                  {course.section && (
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Sec {course.section}
                    </span>
                  )}
                  {getStatusBadge(course.status)}
                  {course.pendingApprovals && course.pendingApprovals > 0 && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                      {course.pendingApprovals} pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-700">{course.title}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.students}/{course.capacity} students
                  </span>
                  {course.slot && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.slot}
                    </span>
                  )}
                  <span>{course.session}</span>
                  <span className="font-medium">{course.credits} credits</span>
                </div>

                {/* Enrollment Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Enrollment</span>
                    <span className="font-semibold text-indigo-600">
                      {enrollmentPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                      style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href={`/instructor/courses/${course.id}`}
            className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
          >
            Manage
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/instructor/pending`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Enrollments
          </Link>
        </div>
      </div>
    </div>
  );
}
