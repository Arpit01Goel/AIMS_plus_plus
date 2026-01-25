'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, X, Eye, Clock, Calendar, Loader2 } from 'lucide-react';

interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  orgId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  session: string;
  enrollType: 'CREDIT' | 'AUDIT' | 'CREDIT_MINOR' | 'CREDIT_CONCENTRATION';
  status: string;
  submittedDate: string;
  instructorName: string;
  currentCredits: number;
  slot?: string;
}

const MAX_CREDITS = 26;

export default function EnrollmentApprovalsPage() {
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<EnrollmentRequest | null>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instructor/advisor/approvals');
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }
      const data = await response.json();
      setRequests(data.enrollments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = sessionFilter === 'all' || request.session === sessionFilter;
    const matchesType = typeFilter === 'all' || request.enrollType === typeFilter;
    return matchesSearch && matchesSession && matchesType;
  });

  const handleApprove = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    if (!confirm(`Approve enrollment for ${request.studentName} in ${request.courseCode}?`)) {
      return;
    }

    try {
      setProcessing(requestId);
      const response = await fetch(`/api/instructor/advisor/approvals/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve enrollment');
      }

      setRequests(requests.filter((r) => r.id !== requestId));
      alert(`Enrollment approved successfully for ${request.studentName}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve enrollment');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    setSelectedRequest(request);
  };

  const confirmReject = async () => {
    if (!selectedRequest || !remarks.trim()) {
      alert('Please provide remarks for rejection.');
      return;
    }

    try {
      setProcessing(selectedRequest.id);
      const response = await fetch(`/api/instructor/advisor/approvals/${selectedRequest.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', remarks }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject enrollment');
      }

      setRequests(requests.filter((r) => r.id !== selectedRequest.id));
      alert(`Enrollment rejected for ${selectedRequest.studentName}.`);
      setSelectedRequest(null);
      setRemarks('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject enrollment');
    } finally {
      setProcessing(null);
    }
  };

  const getEnrollTypeBadge = (type: EnrollmentRequest['enrollType']) => {
    const styles = {
      CREDIT: 'bg-blue-100 text-blue-800',
      AUDIT: 'bg-purple-100 text-purple-800',
      CREDIT_MINOR: 'bg-green-100 text-green-800',
      CREDIT_CONCENTRATION: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      CREDIT: 'Credit',
      AUDIT: 'Audit',
      CREDIT_MINOR: 'Minor',
      CREDIT_CONCENTRATION: 'Concentration',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const getCreditStatus = (current: number, additional: number) => {
    const total = current + additional;
    if (total > MAX_CREDITS) {
      return <span className="font-semibold text-red-600">⚠️ Exceeds limit</span>;
    } else if (total === MAX_CREDITS) {
      return <span className="font-semibold text-orange-600">At maximum</span>;
    }
    return <span className="font-semibold text-green-600">Within limit</span>;
  };

  const stats = {
    total: requests.length,
    creditType: requests.filter((r) => r.enrollType === 'CREDIT').length,
    auditType: requests.filter((r) => r.enrollType === 'AUDIT').length,
    overload: requests.filter((r) => r.currentCredits + r.credits > MAX_CREDITS).length,
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchEnrollments}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Enrollment Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Pending Enrollment Approvals
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Review and approve/reject course enrollment requests from your batch students
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Pending Approvals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.creditType}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Credit Enrollments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.auditType}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Audit Enrollments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.overload}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Credit Overload</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Enrollment Requests</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, ID, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Sessions</option>
              <option value="2025-II">2025-II (Fall)</option>
              <option value="2025-I">2025-I (Spring)</option>
              <option value="2024-II">2024-II</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="AUDIT">Audit</option>
              <option value="CREDIT_MINOR">Minor</option>
              <option value="CREDIT_CONCENTRATION">Concentration</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="mt-6 space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{request.studentName}</h3>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {request.orgId}
                    </span>
                    {getEnrollTypeBadge(request.enrollType)}
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {request.courseCode} - {request.courseTitle} {request.slot ? `(${request.slot})` : ''}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Session: {request.session}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                    </span>
                    <span>Credits: {request.credits}</span>
                    <span>Instructor: {request.instructorName}</span>
                  </div>

                  {/* <div className="mt-3 rounded-lg bg-white p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">Credit Analysis:</span>
                      {getCreditStatus(request.currentCredits, request.credits)}
                    </div>
                    <p className="mt-1 text-slate-600">
                      Current: {request.currentCredits} + New: {request.credits} ={' '}
                      {request.currentCredits + request.credits} / {MAX_CREDITS} (Max)
                    </p>
                  </div> */}
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No pending enrollment requests.</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Reject Enrollment Request</h3>
            <p className="mt-2 text-sm text-slate-600">
              Rejecting enrollment for <strong>{selectedRequest.studentName}</strong> in{' '}
              <strong>{selectedRequest.courseCode}</strong>
            </p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rejection Remarks <span className="text-red-600">*</span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter reason for rejection (will be sent to student via email)"
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmReject}
                disabled={processing === selectedRequest.id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {processing === selectedRequest.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRemarks('');
                }}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
