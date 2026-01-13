'use client';

import { useState } from 'react';
import { AlertCircle, Check, X, Clock, User } from 'lucide-react';

interface PendingAction {
  id: string;
  type: 'enrollment' | 'grade_submission' | 'course_approval';
  student?: {
    rollNo: string;
    name: string;
  };
  course: {
    code: string;
    title: string;
  };
  details: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

export default function PendingActionsPage() {
  const [actions, setActions] = useState<PendingAction[]>([
    {
      id: '1',
      type: 'enrollment',
      student: {
        rollNo: '2021CSB1111',
        name: 'Rahul Sharma',
      },
      course: {
        code: 'CS604',
        title: 'Advanced Operating Systems',
      },
      details: 'Student requests enrollment approval for CS604',
      timestamp: '2 hours ago',
      priority: 'high',
    },
    {
      id: '2',
      type: 'enrollment',
      student: {
        rollNo: '2021CSB1155',
        name: 'Priya Patel',
      },
      course: {
        code: 'CS701',
        title: 'Distributed Systems',
      },
      details: 'Student requests enrollment approval for CS701',
      timestamp: '5 hours ago',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'grade_submission',
      course: {
        code: 'CS502',
        title: 'Data Structures and Algorithms',
      },
      details: 'Mid-term grades submission deadline approaching',
      timestamp: 'Due: Jan 15, 2026',
      priority: 'high',
    },
    {
      id: '4',
      type: 'enrollment',
      student: {
        rollNo: '2021CSB1089',
        name: 'Amit Kumar',
      },
      course: {
        code: 'CS604',
        title: 'Advanced Operating Systems',
      },
      details: 'Student requests enrollment approval for CS604',
      timestamp: '1 day ago',
      priority: 'low',
    },
    {
      id: '5',
      type: 'course_approval',
      course: {
        code: 'CS801',
        title: 'Advanced Machine Learning',
      },
      details: 'Course offering awaiting HoD approval',
      timestamp: '3 days ago',
      priority: 'medium',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'enrollment' | 'grade_submission' | 'course_approval'>('all');

  const handleApprove = (id: string) => {
    setActions(actions.filter((action) => action.id !== id));
    // Will integrate with backend API
    alert('Approval will be integrated with backend!');
  };

  const handleReject = (id: string) => {
    setActions(actions.filter((action) => action.id !== id));
    // Will integrate with backend API
    alert('Rejection will be integrated with backend!');
  };

  const filteredActions = actions.filter(
    (action) => filter === 'all' || action.type === filter
  );

  const getTypeLabel = (type: PendingAction['type']) => {
    const labels = {
      enrollment: 'Enrollment Request',
      grade_submission: 'Grade Submission',
      course_approval: 'Course Approval',
    };
    return labels[type];
  };

  const getTypeColor = (type: PendingAction['type']) => {
    const colors = {
      enrollment: 'bg-blue-100 text-blue-800 border-blue-200',
      grade_submission: 'bg-orange-100 text-orange-800 border-orange-200',
      course_approval: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type];
  };

  const getPriorityColor = (priority: PendingAction['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[priority];
  };

  const stats = {
    all: actions.length,
    enrollment: actions.filter((a) => a.type === 'enrollment').length,
    grade_submission: actions.filter((a) => a.type === 'grade_submission').length,
    course_approval: actions.filter((a) => a.type === 'course_approval').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          Action Required
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Pending Actions
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Review and approve enrollment requests, grade submissions, and other pending tasks
        </p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.all}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.enrollment}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Enrollments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {stats.grade_submission}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">Grade Submissions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.course_approval}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">Course Approvals</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
        {[
          { value: 'all', label: 'All Actions' },
          { value: 'enrollment', label: 'Enrollments' },
          { value: 'grade_submission', label: 'Grade Submissions' },
          { value: 'course_approval', label: 'Course Approvals' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as typeof filter)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.map((action) => (
          <div
            key={action.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTypeColor(
                        action.type
                      )}`}
                    >
                      {getTypeLabel(action.type)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(
                        action.priority
                      )}`}
                    >
                      {action.priority.toUpperCase()}
                    </span>
                  </div>

                  {action.student && (
                    <div className="mt-3 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-900">
                        {action.student.name}
                      </p>
                      <span className="text-sm text-slate-600">
                        ({action.student.rollNo})
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {action.course.code} - {action.course.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{action.details}</p>

                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {action.timestamp}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleApprove(action.id)}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(action.id)}
                  className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Actions */}
      {filteredActions.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Check className="mx-auto h-16 w-16 text-green-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            All Caught Up!
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            No pending actions at the moment. Check back later for new requests.
          </p>
        </div>
      )}
    </div>
  );
}
