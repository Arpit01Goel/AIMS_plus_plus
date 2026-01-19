'use client';

import { ClipboardCheck, Users, AlertCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface DashboardData {
  stats: {
    pendingApprovals: number;
    totalStudents: number;
    creditViolations: number;
    avgGPA: number;
  };
  pendingEnrollments: Array<{
    id: string;
    studentName: string;
    studentId: string;
    course: string;
    session: string;
    type: string;
    submittedDate: string;
  }>;
  recentActivity: Array<{
    id: string;
    message: string;
    time: string;
    type: string;
  }>;
}

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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/advisor/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">Error: {error || 'Failed to load dashboard'}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, pendingEnrollments, recentActivity } = dashboardData;

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
          value={stats.totalStudents}
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
            {pendingEnrollments.slice(0, 3).map((approval) => (
              <div
                key={approval.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{approval.studentName}</p>
                    <p className="text-xs text-slate-600">{approval.studentId}</p>
                    <p className="mt-2 text-sm text-slate-700">{approval.course}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800">
                        {approval.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(approval.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {pendingEnrollments.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No pending approvals</p>
            )}
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
