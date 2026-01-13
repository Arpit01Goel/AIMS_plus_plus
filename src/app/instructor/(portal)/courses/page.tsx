'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Clock, ChevronRight, Search, Filter } from 'lucide-react';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  ltpsc: string;
  credits: number;
  status: 'enrolling' | 'ongoing' | 'completed';
  session: string;
  enrolledStudents: number;
  maxCapacity: number;
  department: string;
  slot: string;
  section: string;
  instructors: string[];
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
  const [courses] = useState<Course[]>([
    {
      id: '1',
      courseCode: 'CS502',
      title: 'DATA STRUCTURES AND ALGORITHMS',
      ltpsc: '3-1-0-6-4',
      credits: 4,
      status: 'ongoing',
      session: '2025-II',
      enrolledStudents: 45,
      maxCapacity: 60,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'A1',
      section: 'A',
      instructors: ['Dr. Rajesh Kumar', 'Dr. Priya Sharma'],
    },
    {
      id: '2',
      courseCode: 'CS604',
      title: 'ADVANCED OPERATING SYSTEMS',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'ongoing',
      session: '2025-II',
      enrolledStudents: 32,
      maxCapacity: 50,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'B2',
      section: 'B',
      instructors: ['Nitin Auluck'],
    },
    {
      id: '3',
      courseCode: 'CS701',
      title: 'DISTRIBUTED SYSTEMS',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'ongoing',
      session: '2025-II',
      enrolledStudents: 28,
      maxCapacity: 40,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'C1',
      section: 'A',
      instructors: ['Dr. Vikram Mehta'],
    },
    {
      id: '4',
      courseCode: 'CS450',
      title: 'COMPUTER NETWORKS',
      ltpsc: '3-0-2-4-4',
      credits: 4,
      status: 'completed',
      session: '2024-II',
      enrolledStudents: 52,
      maxCapacity: 60,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'D1',
      section: 'A',
      instructors: ['Dr. Vikram Mehta'],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'enrolling' | 'completed'>('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const ongoingCourses = filteredCourses.filter((c) => c.status === 'ongoing');
  const enrollingCourses = filteredCourses.filter((c) => c.status === 'enrolling');
  const completedCourses = filteredCourses.filter((c) => c.status === 'completed');

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
              View and manage all courses you're teaching this semester
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
              {filteredCourses.reduce((sum, c) => sum + c.enrolledStudents, 0)}
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
  getStatusBadge: (status: Course['status']) => JSX.Element;
}) {
  const enrollmentPercentage = (course.enrolledStudents / course.maxCapacity) * 100;

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
                  <h3 className="text-lg font-bold text-slate-900">{course.courseCode}</h3>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                    Sec {course.section}
                  </span>
                  {getStatusBadge(course.status)}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-700">{course.title}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.enrolledStudents}/{course.maxCapacity} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.slot}
                  </span>
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
                      style={{ width: `${enrollmentPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Instructors */}
            {course.instructors.length > 1 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Co-instructors:</span>
                <span className="text-xs text-slate-600">{course.instructors.join(', ')}</span>
              </div>
            )}
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
            href={`/instructor/courses/${course.id}/enrollments`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Enrollments
          </Link>
        </div>
      </div>
    </div>
  );
}
