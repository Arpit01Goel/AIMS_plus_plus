'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Users, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CourseOffering {
  id: string;
  capacity: number;
  slot: string | null;
  status: 'ENROLLING' | 'RUNNING' | 'COMPLETED';
  course: {
    code: string;
    title: string;
    department: {
      name: string;
      code: string;
    } | null;
  };
  academicSession: {
    id: string;
    code: string;
  };
  primaryInstructor: {
    user: {
      name: string | null;
    };
  } | null;
  _count: {
    enrollments: number;
  };
}

interface AcademicSession {
  id: string;
  code: string;
  isCurrent: boolean;
}

export default function OfferingsManagementPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/offerings');
      if (!response.ok) throw new Error('Failed to fetch offerings');
      const data = await response.json();
      setOfferings(data.offerings || []);
      setSessions(data.sessions || []);

      // Set default session filter to current session if available
      const currentSession = data.sessions?.find((s: AcademicSession) => s.isCurrent);
      if (currentSession) {
        setSessionFilter(currentSession.id);
      } else if (data.sessions?.length > 0) {
        setSessionFilter('all');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOfferings = offerings.filter((offering) => {
    const matchesSearch =
      offering.course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = sessionFilter === 'all' || offering.academicSession.id === sessionFilter;
    const matchesStatus = statusFilter === 'all' || offering.status === statusFilter;
    return matchesSearch && matchesSession && matchesStatus;
  });

  const handleBulkEnroll = async (offeringId: string) => {
    const pattern = prompt('Enter enrollment pattern (e.g., 2023CS* for all 2023 CS students):');
    if (!pattern) return;

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_enroll_admin',
          offeringId,
          pattern,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bulk enrollment failed');

      alert(data.message);
      fetchData(); // Refresh counts
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: CourseOffering['status']) => {
    const styles = {
      ENROLLING: 'bg-green-100 text-green-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
    };
    const labels = {
      ENROLLING: 'Enrolling',
      RUNNING: 'Running',
      COMPLETED: 'Completed',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: offerings.length,
    enrolling: offerings.filter((o) => o.status === 'ENROLLING').length,
    running: offerings.filter((o) => o.status === 'RUNNING').length,
    completed: offerings.filter((o) => o.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Course Offerings
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Course Offerings
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Float courses for semesters and manage enrollments
            </p>
          </div>
          <Link
            href="/admin/offerings/create"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Float New Offering
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Offerings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.enrolling}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Enrolling</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Running</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Completed</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Course Offerings</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code or title..."
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
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.code}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="ENROLLING">Enrolling</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-600">Loading offerings...</div>
          ) : filteredOfferings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">No offerings found matching your filters.</p>
            </div>
          ) : (
            filteredOfferings.map((offering) => {
              const enrolled = offering._count?.enrollments || 0;
              const enrollmentPercent = (enrolled / offering.capacity) * 100;
              return (
                <div
                  key={offering.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {offering.course.code}
                        </h3>
                        {getStatusBadge(offering.status)}
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {offering.course.title}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {offering.academicSession.code}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          Slot: {offering.slot || 'N/A'}
                        </span>
                        <span>{offering.course.department?.name || 'No Department'}</span>
                        <span>Coordinator: {offering.primaryInstructor?.user.name || 'N/A'}</span>
                      </div>

                      {/* Enrollment Progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">
                            <Users className="inline h-3.5 w-3.5" /> Enrollment
                          </span>
                          <span className="font-semibold text-indigo-600">
                            {enrolled}/{offering.capacity} ({enrollmentPercent.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                            style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <Link
                        href={`/admin/offerings/${offering.id}`}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleBulkEnroll(offering.id)}
                        className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        Bulk Enroll
                      </button>
                      <Link
                        href={`/admin/enrollments?offering=${offering.id}`}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Manage Enrollments
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
