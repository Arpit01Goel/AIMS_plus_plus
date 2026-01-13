'use client';

import { ClipboardCheck, Users, AlertCircle, TrendingUp, Clock } from 'lucide-react';
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

export default function AdvisorDashboard() {
  const stats = {
    pendingApprovals: 8,
    batchStudents: 45,
    creditViolations: 3,
    avgGPA: 3.72,
  };

  const pendingApprovals = [
    {
      id: 1,
      student: 'Rahul Verma',
      studentId: '2021CS001',
      course: 'CS502 - Data Structures',
      session: '2025-II',
      type: 'Credit',
      submittedDate: '2026-01-10',
    },
    {
      id: 2,
      student: 'Priya Sharma',
      studentId: '2021CS015',
      course: 'CS604 - Operating Systems',
      session: '2025-II',
      type: 'Credit',
      submittedDate: '2026-01-11',
    },
    {
      id: 3,
      student: 'Amit Kumar',
      studentId: '2021CS022',
      course: 'CS801 - Machine Learning',
      session: '2025-II',
      type: 'Audit',
      submittedDate: '2026-01-12',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      message: 'Approved enrollment for Neha Gupta in CS701',
      time: '2 hours ago',
      type: 'approval',
    },
    {
      id: 2,
      message: 'Credit violation alert for Vikram Singh',
      time: '5 hours ago',
      type: 'alert',
    },
    {
      id: 3,
      message: 'Rejected enrollment for Arjun Patel in CS502 - Time conflict',
      time: '1 day ago',
      type: 'rejection',
    },
    {
      id: 4,
      message: 'Approved enrollment for Sanjay Kumar in EE201',
      time: '2 days ago',
      type: 'approval',
    },
  ];

  const batchInfo = {
    department: 'Computer Science',
    yearOfEntry: '2021',
    degree: 'M.Tech',
    totalStudents: 45,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Advisor Dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Monitor your batch students and manage enrollment approvals
        </p>

        {/* Batch Info */}
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-sm font-semibold text-indigo-900">Your Assigned Batch</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-indigo-800">
            <span>
              <strong>Department:</strong> {batchInfo.department}
            </span>
            <span>
              <strong>Degree:</strong> {batchInfo.degree}
            </span>
            <span>
              <strong>Year of Entry:</strong> {batchInfo.yearOfEntry}
            </span>
            <span>
              <strong>Students:</strong> {batchInfo.totalStudents}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardCheck}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          subtext="Enrollment requests"
          color="bg-orange-500"
          href="/advisor/approvals"
        />
        <StatCard
          icon={Users}
          label="Batch Students"
          value={stats.batchStudents}
          subtext="Total assigned"
          color="bg-blue-500"
          href="/advisor/students"
        />
        <StatCard
          icon={AlertCircle}
          label="Credit Violations"
          value={stats.creditViolations}
          subtext="Require attention"
          color="bg-red-500"
          href="/advisor/violations"
        />
        <StatCard
          icon={TrendingUp}
          label="Batch Avg GPA"
          value={stats.avgGPA}
          subtext="Current semester"
          color="bg-green-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
            <Link
              href="/advisor/approvals"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {pendingApprovals.map((approval) => (
              <div
                key={approval.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{approval.student}</p>
                    <p className="text-xs text-slate-600">{approval.studentId}</p>
                    <p className="mt-2 text-sm text-slate-700">{approval.course}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
                        {approval.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {approval.submittedDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>

          <div className="mt-4 space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    activity.type === 'approval'
                      ? 'bg-green-100'
                      : activity.type === 'alert'
                        ? 'bg-orange-100'
                        : 'bg-red-100'
                  }`}
                >
                  {activity.type === 'approval' ? (
                    <ClipboardCheck
                      className={`h-4 w-4 ${
                        activity.type === 'approval'
                          ? 'text-green-600'
                          : activity.type === 'alert'
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}
                    />
                  ) : (
                    <AlertCircle
                      className={`h-4 w-4 ${
                        activity.type === 'approval'
                          ? 'text-green-600'
                          : activity.type === 'alert'
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{activity.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
