'use client';

import { AlertCircle, BookOpen, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

// Reusable Card Component
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// Stat Component
function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-indigo-600">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{sub}</p>
    </div>
  );
}

const activeCourses = [
  {
    code: 'CS502',
    title: 'Data Structures and Algorithms',
    students: 45,
    section: 'A',
    session: '2025-II',
  },
  {
    code: 'CS604',
    title: 'Advanced Operating Systems',
    students: 32,
    section: 'B',
    session: '2025-II',
  },
  {
    code: 'CS701',
    title: 'Distributed Systems',
    students: 28,
    section: 'A',
    session: '2025-II',
  },
];

const pendingActions = [
  {
    type: 'Enrollment Request',
    student: 'Rahul Sharma (2021CSB1111)',
    course: 'CS604 - Advanced Operating Systems',
    time: '2 hours ago',
  },
  {
    type: 'Grade Submission',
    student: 'Mid-term grades for CS502',
    course: 'Due: Jan 15, 2026',
    time: 'Deadline approaching',
  },
  {
    type: 'Enrollment Request',
    student: 'Priya Patel (2021CSB1155)',
    course: 'CS701 - Distributed Systems',
    time: '5 hours ago',
  },
];

const upcomingClasses = [
  {
    time: '09:00 AM',
    course: 'CS502 - Data Structures',
    location: 'LHC-101',
    section: 'Section A',
  },
  {
    time: '02:00 PM',
    course: 'CS604 - Operating Systems',
    location: 'LHC-205',
    section: 'Section B',
  },
  {
    time: '04:30 PM',
    course: 'CS701 - Distributed Systems',
    location: 'Online',
    section: 'Section A',
  },
];

const recentActivity = [
  {
    action: 'Uploaded grades for CS502 Quiz-2',
    timestamp: '2 hours ago',
  },
  {
    action: 'Approved 3 enrollment requests for CS604',
    timestamp: '5 hours ago',
  },
  {
    action: 'Posted assignment for CS701',
    timestamp: 'Yesterday',
  },
  {
    action: 'Updated course materials for CS502',
    timestamp: '2 days ago',
  },
];

export default function InstructorDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Faculty Portal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Instructor Dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Manage your courses, track student progress, and handle administrative tasks.
        </p>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-6 rounded-xl border border-slate-100 bg-slate-50 p-6 sm:grid-cols-4">
          <Stat label="Active Courses" value="3" sub="This Semester" />
          <Stat label="Total Students" value="105" sub="Across All Courses" />
          <Stat label="Pending Actions" value="3" sub="Require Attention" />
          <Stat label="Avg. Attendance" value="94%" sub="Past 30 Days" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="space-y-6 lg:col-span-2">
          {/* Active Courses */}
          <Card title="Active Courses">
            <div className="space-y-3">
              {activeCourses.map((course) => (
                <Link
                  key={course.code}
                  href={`/instructor/courses/${course.code}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-indigo-300 hover:bg-indigo-50">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-slate-900">
                            {course.code}
                          </p>
                          <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                            Sec {course.section}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{course.title}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course.students} students
                          </span>
                          <span>{course.session}</span>
                        </div>
                      </div>
                    </div>
                    <button className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50">
                      Manage
                    </button>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/instructor/courses"
              className="mt-4 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All Courses →
            </Link>
          </Card>

          {/* Today's Schedule */}
          <Card title="Today's Schedule">
            <div className="space-y-3">
              {upcomingClasses.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                        {item.time}
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {item.course}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {item.location} · {item.section}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    Join Class
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <div className="space-y-2">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm text-slate-700">{activity.action}</p>
                  <span className="text-xs font-medium text-slate-500">
                    {activity.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <Card title="Pending Actions">
            <div className="space-y-3">
              {pendingActions.map((action, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-slate-50 px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                        {action.type}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {action.student}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">{action.course}</p>
                      <p className="mt-1 text-xs text-slate-500">{action.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/instructor/pending"
              className="mt-4 block text-center text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View All Pending Actions →
            </Link>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Float Course', href: '/instructor/create-course' },
                { label: 'Upload Grades', href: '/instructor/grades' },
                { label: 'Mark Attendance', href: '/instructor/attendance' },
                { label: 'View Reports', href: '/instructor/courses' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex h-20 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-center text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </Card>

          {/* Performance Overview */}
          <Card title="Performance Overview">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">CS502 - Avg. Score</span>
                  <span className="font-semibold text-indigo-600">78%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                    style={{ width: '78%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">CS604 - Avg. Score</span>
                  <span className="font-semibold text-indigo-600">82%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                    style={{ width: '82%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">CS701 - Avg. Score</span>
                  <span className="font-semibold text-indigo-600">85%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
