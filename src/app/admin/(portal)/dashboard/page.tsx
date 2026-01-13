'use client';

import {
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';
import Link from 'next/link';

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  href?: string;
}) {
  const content = (
    <>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{subtext}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {content}
    </div>
  );
}

export default function AdminDashboard() {
  const stats = {
    totalUsers: 1247,
    newUsersThisMonth: 45,
    totalCourses: 156,
    activeCourses: 78,
    pendingEnrollments: 23,
    totalEnrollments: 3456,
    pendingGrades: 12,
    gradesSubmitted: 156,
    pendingApprovals: 8,
    systemHealth: '98%',
  };

  const recentActivities = [
    {
      id: 1,
      type: 'user',
      message: 'Bulk user upload completed: 45 new students added',
      time: '10 minutes ago',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      id: 2,
      type: 'course',
      message: 'New course approved: CS801 - Advanced Machine Learning',
      time: '1 hour ago',
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      id: 3,
      type: 'enrollment',
      message: '23 enrollment requests pending instructor approval',
      time: '2 hours ago',
      icon: AlertCircle,
      color: 'text-orange-600',
    },
    {
      id: 4,
      type: 'grades',
      message: 'Dr. Vikram Mehta submitted grades for CS701',
      time: '3 hours ago',
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      id: 5,
      type: 'system',
      message: 'Academic calendar updated for 2026-I session',
      time: '5 hours ago',
      icon: Calendar,
      color: 'text-indigo-600',
    },
  ];

  const pendingActions = [
    {
      id: 1,
      title: 'Course Approval Pending',
      description: '3 courses awaiting approval from HoD',
      count: 3,
      priority: 'high',
      href: '/admin/courses?status=pending',
    },
    {
      id: 2,
      title: 'Enrollment Overrides',
      description: '5 credit limit violations need review',
      count: 5,
      priority: 'medium',
      href: '/admin/enrollments?status=violations',
    },
    {
      id: 3,
      title: 'Grade Verification',
      description: '12 grade submissions awaiting verification',
      count: 12,
      priority: 'medium',
      href: '/admin/grades?status=pending',
    },
    {
      id: 4,
      title: 'PhD DC Approvals',
      description: '2 doctoral committee proposals pending',
      count: 2,
      priority: 'low',
      href: '/admin/phd?tab=dc',
    },
  ];

  const quickStats = {
    thisSession: {
      courses: 78,
      enrollments: 2134,
      students: 856,
      faculty: 42,
    },
    avgPerformance: {
      attendance: 92,
      cgpa: 7.8,
      completionRate: 94,
    },
  };

  const upcomingEvents = [
    { event: 'Course Registration Deadline', date: 'Jan 18, 2026', daysLeft: 5 },
    { event: 'Add/Drop Deadline', date: 'Jan 25, 2026', daysLeft: 12 },
    { event: 'Mid-Semester Exams Begin', date: 'Feb 15, 2026', daysLeft: 33 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Admin Control Panel
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              System Dashboard
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Complete oversight and management of the academic system
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm font-semibold text-green-900">System Online</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          subtext={`+${stats.newUsersThisMonth} this month`}
          color="bg-blue-600"
          href="/admin/users"
        />
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value={stats.activeCourses}
          subtext={`${stats.totalCourses} total courses`}
          color="bg-green-600"
          href="/admin/courses"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Enrollments"
          value={stats.totalEnrollments}
          subtext={`${stats.pendingEnrollments} pending`}
          color="bg-indigo-600"
          href="/admin/enrollments"
        />
        <StatCard
          icon={FileText}
          label="Grades Submitted"
          value={stats.gradesSubmitted}
          subtext={`${stats.pendingGrades} pending`}
          color="bg-purple-600"
          href="/admin/grades"
        />
      </div>

      {/* Pending Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Pending Actions</h2>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {pendingActions.reduce((sum, action) => sum + action.count, 0)} items
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pendingActions.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className="group rounded-xl border-2 border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{action.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        action.priority === 'high'
                          ? 'bg-indigo-100 text-indigo-700'
                          : action.priority === 'medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {action.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{action.description}</p>
                </div>
                <span className="ml-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-700">
                  {action.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Session Stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Current Session (2025-II)</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Academic Activity</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Active Courses</span>
                    <span className="font-bold text-slate-900">{quickStats.thisSession.courses}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Enrollments</span>
                    <span className="font-bold text-slate-900">{quickStats.thisSession.enrollments}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                      style={{ width: '92%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Active Students</span>
                    <span className="font-bold text-slate-900">{quickStats.thisSession.students}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                      style={{ width: '86%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700">Performance Metrics</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Avg. Attendance</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {quickStats.avgPerformance.attendance}%
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Avg. CGPA</span>
                    <Award className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-600">
                    {quickStats.avgPerformance.cgpa}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Completion Rate</span>
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-purple-600">
                    {quickStats.avgPerformance.completionRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
          <div className="mt-4 space-y-3">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{event.event}</p>
                    <p className="mt-1 text-xs text-slate-600">{event.date}</p>
                    <p className="mt-1 text-xs font-medium text-indigo-600">
                      {event.daysLeft} days left
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/calendar"
            className="mt-4 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View Full Calendar →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
        <div className="mt-4 space-y-3">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Add Users', href: '/admin/users/create', color: 'hover:bg-blue-50 hover:border-blue-300' },
            { label: 'Create Course', href: '/admin/courses/create', color: 'hover:bg-green-50 hover:border-green-300' },
            { label: 'Float Offering', href: '/admin/offerings/create', color: 'hover:bg-indigo-50 hover:border-indigo-300' },
            { label: 'Generate Reports', href: '/admin/reports', color: 'hover:bg-purple-50 hover:border-purple-300' },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex h-24 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-center text-sm font-semibold text-slate-700 transition ${action.color}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
