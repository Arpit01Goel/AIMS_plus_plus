'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Clock, User } from 'lucide-react';

interface PendingAction {
  id: string;
  student: {
    id: string;
    entryNumber: string;
    name: string;
    program: string;
  };
  course: {
    code: string;
    title: string;
    session: string;
  };
  enrollmentType: string;
  createdAt: string;
}

export default function PendingActionsPage() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingActions();
  }, []);

  const loadPendingActions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/enrollments');
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load pending actions');

      setActions(json.pending || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending actions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (enrollmentId: string, action: 'approve' | 'reject') => {
    if (processing) return;

    try {
      setProcessing(enrollmentId);
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, action }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');

      // Remove from list on success
      setActions((prev) => prev.filter((a) => a.id !== enrollmentId));
      alert(json.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Loading pending actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error loading pending actions</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
        <button
          onClick={loadPendingActions}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getTypeLabel = (type: string) => 'Enrollment Request';
  const getTypeColor = (type: string) => 'bg-blue-100 text-blue-800 border-blue-200';

  const stats = {
    all: actions.length,
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
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.all}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.all}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Enrollment Requests</p>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action) => (
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
                    <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      Enrollment Request
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {action.enrollmentType}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-900">
                      {action.student.name}
                    </p>
                    <span className="text-sm text-slate-600">
                      ({action.student.entryNumber})
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {action.student.program}
                    </span>
                  </div>

                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {action.course.code} - {action.course.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Session: <span className="font-medium">{action.course.session}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(action.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => handleAction(action.id, 'approve')}
                  disabled={processing === action.id}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {processing === action.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction(action.id, 'reject')}
                  disabled={processing === action.id}
                  className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  {processing === action.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Actions */}
      {actions.length === 0 && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Check className="mx-auto h-16 w-16 text-green-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            All Caught Up!
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            No pending enrollment requests at the moment. Check back later for new requests.
          </p>
        </div>
      )}
    </div>
  );
}
