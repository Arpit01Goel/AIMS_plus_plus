'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Check, X, Clock, User, Filter, ArrowUpDown, CheckSquare } from 'lucide-react';

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

export default function PendingActionsPage() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [filtersData, setFiltersData] = useState<FiltersData>({ departments: [], batches: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

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
      setFiltersData(json.filters || { departments: [], batches: [] });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending actions');
    } finally {
      setLoading(false);
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



  const stats = {
    all: actions.length,
    filtered: filteredAndSortedActions.length,
  };

  if (loading && actions.length === 0) {
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
          Review and approve student enrollment requests
        </p>

        {/* Stats */}
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
      </div>

      {error && (
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
      )}

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


