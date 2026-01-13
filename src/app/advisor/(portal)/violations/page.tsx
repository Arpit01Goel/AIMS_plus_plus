'use client';

import { useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Mail, Eye, TrendingUp, TrendingDown } from 'lucide-react';

interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  orgId: string;
  violationType: 'excessive' | 'insufficient' | 'category';
  severity: 'high' | 'medium' | 'low';
  description: string;
  currentCredits: number;
  maxCredits?: number;
  minCredits?: number;
  categoryDeficit?: string;
  session: string;
  reportedDate: string;
  status: 'pending' | 'reviewed' | 'resolved';
  advisorRemarks?: string;
}

export default function CreditViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([
    {
      id: '1',
      studentId: 'STU001',
      studentName: 'Amit Kumar',
      orgId: '2021CS022',
      violationType: 'excessive',
      severity: 'high',
      description: 'Student enrolled in 28 credits, exceeding maximum limit of 24',
      currentCredits: 28,
      maxCredits: 24,
      session: '2025-II',
      reportedDate: '2026-01-10',
      status: 'pending',
    },
    {
      id: '2',
      studentId: 'STU002',
      studentName: 'Vikram Singh',
      orgId: '2021CS047',
      violationType: 'insufficient',
      severity: 'medium',
      description: 'Student enrolled in only 10 credits, below minimum of 16',
      currentCredits: 10,
      minCredits: 16,
      session: '2025-II',
      reportedDate: '2026-01-11',
      status: 'pending',
    },
    {
      id: '3',
      studentId: 'STU003',
      studentName: 'Karan Mehta',
      orgId: '2021CS061',
      violationType: 'category',
      severity: 'medium',
      description: 'Insufficient humanities credits. Required: 6, Enrolled: 2',
      currentCredits: 18,
      categoryDeficit: 'Humanities (4 credits short)',
      session: '2025-II',
      reportedDate: '2026-01-12',
      status: 'reviewed',
      advisorRemarks: 'Student advised to enroll in HS courses next semester',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [remarks, setRemarks] = useState('');

  const filteredViolations = violations.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.orgId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || v.violationType === typeFilter;
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: violations.length,
    pending: violations.filter((v) => v.status === 'pending').length,
    high: violations.filter((v) => v.severity === 'high').length,
    excessive: violations.filter((v) => v.violationType === 'excessive').length,
    insufficient: violations.filter((v) => v.violationType === 'insufficient').length,
  };

  const getSeverityBadge = (severity: Violation['severity']) => {
    if (severity === 'high')
      return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">High</span>;
    if (severity === 'medium')
      return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">Medium</span>;
    return <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">Low</span>;
  };

  const getStatusBadge = (status: Violation['status']) => {
    if (status === 'resolved')
      return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Resolved</span>;
    if (status === 'reviewed')
      return <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">Reviewed</span>;
    return <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">Pending</span>;
  };

  const getViolationIcon = (type: Violation['violationType']) => {
    if (type === 'excessive') return <TrendingUp className="h-5 w-5 text-red-600" />;
    if (type === 'insufficient') return <TrendingDown className="h-5 w-5 text-orange-600" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
  };

  const handleReview = (violationId: string) => {
    const violation = violations.find((v) => v.id === violationId);
    if (!violation) return;
    setSelectedViolation(violation);
    setRemarks(violation.advisorRemarks || '');
  };

  const submitReview = () => {
    if (!selectedViolation || !remarks.trim()) {
      alert('Please provide remarks for this violation.');
      return;
    }

    setViolations(
      violations.map((v) =>
        v.id === selectedViolation.id
          ? { ...v, status: 'reviewed', advisorRemarks: remarks }
          : v
      )
    );

    alert(`Violation reviewed. Email notification sent to ${selectedViolation.studentName}.`);
    setSelectedViolation(null);
    setRemarks('');
  };

  const markResolved = (violationId: string) => {
    const violation = violations.find((v) => v.id === violationId);
    if (!violation) return;

    if (confirm(`Mark violation as resolved for ${violation.studentName}?`)) {
      setViolations(violations.map((v) => (v.id === violationId ? { ...v, status: 'resolved' } : v)));
      alert('Violation marked as resolved.');
    }
  };

  const sendReminder = (violationId: string) => {
    const violation = violations.find((v) => v.id === violationId);
    if (!violation) return;

    alert(`Reminder email sent to ${violation.studentName} regarding credit violation.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Credit Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Credit Violations
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Monitor and resolve credit violations for your batch students
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Violations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Pending Review</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.high}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">High Severity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">{stats.excessive}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Excessive Credits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.insufficient}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Insufficient Credits</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Violation Reports</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types</option>
              <option value="excessive">Excessive Credits</option>
              <option value="insufficient">Insufficient Credits</option>
              <option value="category">Category Deficit</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Violations List */}
        <div className="mt-6 space-y-3">
          {filteredViolations.map((violation) => (
            <div
              key={violation.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-white p-3 shadow-sm">
                    {getViolationIcon(violation.violationType)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{violation.studentName}</h3>
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {violation.orgId}
                      </span>
                      {getSeverityBadge(violation.severity)}
                      {getStatusBadge(violation.status)}
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-700">{violation.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span>Session: {violation.session}</span>
                      <span>Reported: {violation.reportedDate}</span>
                      <span className="font-semibold">Credits: {violation.currentCredits}</span>
                      {violation.maxCredits && <span>Max: {violation.maxCredits}</span>}
                      {violation.minCredits && <span>Min: {violation.minCredits}</span>}
                      {violation.categoryDeficit && (
                        <span className="font-medium text-orange-700">{violation.categoryDeficit}</span>
                      )}
                    </div>

                    {violation.advisorRemarks && (
                      <div className="mt-3 rounded-lg bg-white p-3 text-xs">
                        <p className="font-semibold text-slate-700">Advisor Remarks:</p>
                        <p className="mt-1 text-slate-600">{violation.advisorRemarks}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  {violation.status === 'pending' && (
                    <button
                      onClick={() => handleReview(violation.id)}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                  )}
                  {violation.status === 'reviewed' && (
                    <button
                      onClick={() => markResolved(violation.id)}
                      className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Resolve
                    </button>
                  )}
                  {violation.status !== 'resolved' && (
                    <button
                      onClick={() => sendReminder(violation.id)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Mail className="h-4 w-4" />
                      Remind
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredViolations.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No credit violations found.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Review Credit Violation</h3>
            <p className="mt-2 text-sm text-slate-600">
              Reviewing violation for <strong>{selectedViolation.studentName}</strong>
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">{selectedViolation.description}</p>
              <div className="mt-2 flex gap-2">
                {getSeverityBadge(selectedViolation.severity)}
                {getStatusBadge(selectedViolation.status)}
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Advisor Remarks <span className="text-red-600">*</span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your review remarks and recommended actions..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitReview}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setSelectedViolation(null);
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
