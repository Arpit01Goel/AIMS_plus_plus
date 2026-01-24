'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Check, X, Clock, User, Filter, ArrowUpDown, CheckSquare, Calendar, UserCheck } from 'lucide-react';

type TabType = 'instructor' | 'advisor';

interface PendingAction {
  id: string;
  student: {
    id: string;
    entryNumber: string;
    name: string;
    program: string;
    department: string;
    branch: string;
    batch: number | null;
    cgpa: number;
  };
  course: {
    code: string;
    title: string;
    session: string;
  };
  enrollmentType: string;
  createdAt: string;
}

interface AdvisorRequest {
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

interface Department {
  code: string;
  name: string;
}

interface FiltersData {
  departments: Department[];
  batches: number[];
}

type SortField = 'name' | 'cgpa' | 'date';
type SortOrder = 'asc' | 'desc';

const MAX_CREDITS = 26;

export default function PendingActionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('instructor');
  
  // Instructor tab states
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData>({ departments: [], batches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Advisor tab states
  const [advisorRequests, setAdvisorRequests] = useState<AdvisorRequest[]>([]);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [advisorProcessing, setAdvisorProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdvisorRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    loadPendingActions();
  }, []);

  useEffect(() => {
    if (activeTab === 'advisor' && advisorRequests.length === 0) {
      loadAdvisorRequests();
    }
  }, [activeTab]);

  const loadPendingActions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/enrollments');
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load pending actions');

      setActions(json.pending || []);
      setFiltersData(json.filters || { departments: [], batches: [] });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending actions');
    } finally {
      setLoading(false);
    }
  };

  const loadAdvisorRequests = async () => {
    try {
      setAdvisorLoading(true);
      const response = await fetch('/api/advisor/approvals');
      if (!response.ok) {
        throw new Error('Failed to fetch advisor enrollments');
      }
      const data = await response.json();
      setAdvisorRequests(data.enrollments || []);
      setAdvisorError(null);
    } catch (err) {
      setAdvisorError(err instanceof Error ? err.message : 'Failed to load advisor requests');
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Filter and sort actions
  const filteredAndSortedActions = useMemo(() => {
    let filtered = actions;

    // Apply filters
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(a => a.student.department === selectedBranch);
    }
    if (selectedYear !== 'all') {
      filtered = filtered.filter(a => a.student.batch === parseInt(selectedYear));
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.student.name.localeCompare(b.student.name);
          break;
        case 'cgpa':
          comparison = a.student.cgpa - b.student.cgpa;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [actions, selectedBranch, selectedYear, sortField, sortOrder]);

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
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(enrollmentId);
        return newSet;
      });
      alert(json.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) {
      alert('Please select at least one enrollment');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedIds.size} enrollment(s)?`)) {
      return;
    }

    try {
      setBulkProcessing(true);
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: action === 'approve' ? 'bulk_approve' : 'bulk_reject',
          enrollmentIds: Array.from(selectedIds)
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Bulk action failed');

      // Remove processed enrollments from list
      setActions((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      alert(json.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedActions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedActions.map(a => a.id)));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Advisor approval handlers
  const handleAdvisorApprove = async (requestId: string) => {
    const request = advisorRequests.find((r) => r.id === requestId);
    if (!request) return;

    if (!confirm(`Approve enrollment for ${request.studentName} in ${request.courseCode}?`)) {
      return;
    }

    try {
      setAdvisorProcessing(requestId);
      const response = await fetch(`/api/advisor/approvals/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve enrollment');
      }

      setAdvisorRequests(advisorRequests.filter((r) => r.id !== requestId));
      alert(`Enrollment approved successfully for ${request.studentName}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve enrollment');
    } finally {
      setAdvisorProcessing(null);
    }
  };

  const handleAdvisorReject = (requestId: string) => {
    const request = advisorRequests.find((r) => r.id === requestId);
    if (!request) return;
    setSelectedRequest(request);
  };

  const confirmAdvisorReject = async () => {
    if (!selectedRequest || !remarks.trim()) {
      alert('Please provide remarks for rejection.');
      return;
    }

    try {
      setAdvisorProcessing(selectedRequest.id);
      const response = await fetch(`/api/advisor/approvals/${selectedRequest.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', remarks }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject enrollment');
      }

      setAdvisorRequests(advisorRequests.filter((r) => r.id !== selectedRequest.id));
      alert(`Enrollment rejected for ${selectedRequest.studentName}.`);
      setSelectedRequest(null);
      setRemarks('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject enrollment');
    } finally {
      setAdvisorProcessing(null);
    }
  };

  const getEnrollTypeBadge = (type: AdvisorRequest['enrollType']) => {
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

  // Filter advisor requests
  const filteredAdvisorRequests = advisorRequests.filter((request) => {
    const matchesSearch =
      request.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = sessionFilter === 'all' || request.session === sessionFilter;
    const matchesType = typeFilter === 'all' || request.enrollType === typeFilter;
    return matchesSearch && matchesSession && matchesType;
  });

  const stats = {
    all: actions.length,
    filtered: filteredAndSortedActions.length,
  };

  const advisorStats = {
    total: advisorRequests.length,
    creditType: advisorRequests.filter((r) => r.enrollType === 'CREDIT').length,
    auditType: advisorRequests.filter((r) => r.enrollType === 'AUDIT').length,
    overload: advisorRequests.filter((r) => r.currentCredits + r.credits > MAX_CREDITS).length,
  };

  const isLoading = activeTab === 'instructor' ? loading : advisorLoading;
  const hasError = activeTab === 'instructor' ? error : advisorError;

  if (isLoading && (activeTab === 'instructor' ? actions.length === 0 : advisorRequests.length === 0)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Loading pending actions...</p>
        </div>
      </div>
    );
  }

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
          Review and approve enrollment requests as an instructor or advisor
        </p>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('instructor')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'instructor'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            Instructor Approvals
            {actions.length > 0 && (
              <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                {actions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'advisor'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Advisor Approvals
            {advisorRequests.length > 0 && (
              <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                {advisorRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        {activeTab === 'instructor' ? (
          <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.all}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Total Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.filtered}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Filtered Results</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{selectedIds.size}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Selected</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{advisorStats.total}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Pending Approvals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{advisorStats.creditType}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Credit Enrollments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{advisorStats.auditType}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Audit Enrollments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{advisorStats.overload}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Credit Overload</p>
            </div>
          </div>
        )}
      </div>

      {hasError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error loading pending actions</h3>
              <p className="text-sm text-red-500">{hasError}</p>
            </div>
          </div>
          <button
            onClick={activeTab === 'instructor' ? loadPendingActions : loadAdvisorRequests}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      )}

      {activeTab === 'instructor' ? (
        <InstructorApprovalsView
          actions={filteredAndSortedActions}
          filtersData={filtersData}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          selectedIds={selectedIds}
          toggleSelectAll={toggleSelectAll}
          toggleSelection={toggleSelection}
          bulkProcessing={bulkProcessing}
          handleBulkAction={handleBulkAction}
          processing={processing}
          handleAction={handleAction}
        />
      ) : (
        <AdvisorApprovalsView
          requests={filteredAdvisorRequests}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sessionFilter={sessionFilter}
          setSessionFilter={setSessionFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          processing={advisorProcessing}
          handleApprove={handleAdvisorApprove}
          handleReject={handleAdvisorReject}
          getEnrollTypeBadge={getEnrollTypeBadge}
          getCreditStatus={getCreditStatus}
        />
      )}

      {/* Advisor Reject Modal */}
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
                onClick={confirmAdvisorReject}
                disabled={advisorProcessing === selectedRequest.id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {advisorProcessing === selectedRequest.id ? 'Processing...' : 'Confirm Rejection'}
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

// Instructor Approvals View Component
function InstructorApprovalsView({
  actions,
  filtersData,
  selectedBranch,
  setSelectedBranch,
  selectedYear,
  setSelectedYear,
  sortField,
  sortOrder,
  handleSort,
  selectedIds,
  toggleSelectAll,
  toggleSelection,
  bulkProcessing,
  handleBulkAction,
  processing,
  handleAction,
}: {
  actions: PendingAction[];
  filtersData: FiltersData;
  selectedBranch: string;
  setSelectedBranch: (value: string) => void;
  selectedYear: string;
  setSelectedYear: (value: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
  selectedIds: Set<string>;
  toggleSelectAll: () => void;
  toggleSelection: (id: string) => void;
  bulkProcessing: boolean;
  handleBulkAction: (action: 'approve' | 'reject') => void;
  processing: string | null;
  handleAction: (enrollmentId: string, action: 'approve' | 'reject') => void;
}) {
  return (
    <>
      {/* Filters and Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter Icon */}
          <div className="flex items-center gap-2 text-slate-700">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filters & Sort:</span>
          </div>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Branches</option>
            {filtersData.departments.map((dept) => (
              <option key={dept.code} value={dept.code}>
                {dept.code} - {dept.name}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Years</option>
            {filtersData.batches.map((batch) => (
              <option key={batch} value={batch}>
                Batch {batch}
              </option>
            ))}
          </select>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Sort by:</span>
            <button
              onClick={() => handleSort('name')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                sortField === 'name'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('cgpa')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                sortField === 'cgpa'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              CGPA {sortField === 'cgpa' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('date')}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                sortField === 'date'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <CheckSquare className="h-4 w-4" />
              {selectedIds.size === actions.length ? 'Deselect All' : 'Select All'}
            </button>
            
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkProcessing}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {bulkProcessing ? 'Processing...' : `Approve ${selectedIds.size}`}
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  disabled={bulkProcessing}
                  className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  {bulkProcessing ? 'Processing...' : `Reject ${selectedIds.size}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action) => (
          <div
            key={action.id}
            className={`rounded-2xl border p-6 shadow-sm transition ${
              selectedIds.has(action.id)
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(action.id)}
                onChange={() => toggleSelection(action.id)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />

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

                  <div className="mt-3 flex flex-wrap items-center gap-2">
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
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {action.student.department}
                    </span>
                    {action.student.batch && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Batch {action.student.batch}
                      </span>
                    )}
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      CGPA: {action.student.cgpa.toFixed(2)}
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
                  disabled={processing === action.id || bulkProcessing}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {processing === action.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleAction(action.id, 'reject')}
                  disabled={processing === action.id || bulkProcessing}
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
      {actions.length === 0 && (
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
    </>
  );
}

// Advisor Approvals View Component
function AdvisorApprovalsView({
  requests,
  searchQuery,
  setSearchQuery,
  sessionFilter,
  setSessionFilter,
  typeFilter,
  setTypeFilter,
  processing,
  handleApprove,
  handleReject,
  getEnrollTypeBadge,
  getCreditStatus,
}: {
  requests: AdvisorRequest[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sessionFilter: string;
  setSessionFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  processing: string | null;
  handleApprove: (requestId: string) => void;
  handleReject: (requestId: string) => void;
  getEnrollTypeBadge: (type: AdvisorRequest['enrollType']) => JSX.Element;
  getCreditStatus: (current: number, additional: number) => JSX.Element;
}) {
  return (
    <>
      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Advisor Enrollment Requests</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by student name, ID, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-4 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
          {requests.map((request) => (
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

                  <div className="mt-3 rounded-lg bg-white p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">Credit Analysis:</span>
                      {getCreditStatus(request.currentCredits, request.credits)}
                    </div>
                    <p className="mt-1 text-slate-600">
                      Current: {request.currentCredits} + New: {request.credits} ={' '}
                      {request.currentCredits + request.credits} / {MAX_CREDITS} (Max)
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {processing === request.id ? 'Processing...' : 'Approve'}
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

        {requests.length === 0 && (
          <div className="py-12 text-center">
            <Check className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No pending enrollment requests from your advisees.</p>
          </div>
        )}
      </div>
    </>
  );
}
