'use client';

import { useState } from 'react';
import { Search, Filter, Plus, Users, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CourseOffering {
  id: string;
  courseCode: string;
  courseTitle: string;
  session: string;
  section: string;
  slot: string;
  department: string;
  status: 'E' | 'R' | 'F' | 'P' | 'D' | 'C';
  coordinator: string;
  instructors: string[];
  enrolled: number;
  capacity: number;
}

export default function OfferingsManagementPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([
    {
      id: '1',
      courseCode: 'CS502',
      courseTitle: 'Data Structures and Algorithms',
      session: '2025-II',
      section: 'A',
      slot: 'A1',
      department: 'Computer Science',
      status: 'R',
      coordinator: 'Dr. Rajesh Kumar',
      instructors: ['Dr. Rajesh Kumar', 'Dr. Priya Sharma'],
      enrolled: 45,
      capacity: 60,
    },
    {
      id: '2',
      courseCode: 'CS604',
      courseTitle: 'Advanced Operating Systems',
      session: '2025-II',
      section: 'B',
      slot: 'B2',
      department: 'Computer Science',
      status: 'E',
      coordinator: 'Dr. Nitin Auluck',
      instructors: ['Dr. Nitin Auluck'],
      enrolled: 32,
      capacity: 50,
    },
    {
      id: '3',
      courseCode: 'CS801',
      courseTitle: 'Advanced Machine Learning',
      session: '2025-II',
      section: 'A',
      slot: 'C1',
      department: 'Computer Science',
      status: 'P',
      coordinator: 'Dr. Amit Singh',
      instructors: ['Dr. Amit Singh'],
      enrolled: 0,
      capacity: 40,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('2025-II');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOfferings = offerings.filter((offering) => {
    const matchesSearch =
      offering.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = offering.session === sessionFilter;
    const matchesStatus = statusFilter === 'all' || offering.status === statusFilter;
    return matchesSearch && matchesSession && matchesStatus;
  });

  const handleBulkEnroll = (offeringId: string) => {
    const pattern = prompt('Enter enrollment pattern (e.g., 2021CS* for all 2021 CS students):');
    if (pattern) {
      alert(`Bulk enrollment for pattern "${pattern}" will be integrated with backend!`);
    }
  };

  const getStatusBadge = (status: CourseOffering['status']) => {
    const styles = {
      P: 'bg-slate-100 text-slate-800',
      E: 'bg-green-100 text-green-800',
      R: 'bg-blue-100 text-blue-800',
      F: 'bg-purple-100 text-purple-800',
      D: 'bg-indigo-100 text-indigo-800',
      C: 'bg-orange-100 text-orange-800',
    };
    const labels = {
      P: 'Proposed',
      E: 'Enrolling',
      R: 'Running',
      F: 'Finished',
      D: 'Declined',
      C: 'Canceled',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: offerings.length,
    enrolling: offerings.filter((o) => o.status === 'E').length,
    running: offerings.filter((o) => o.status === 'R').length,
    proposed: offerings.filter((o) => o.status === 'P').length,
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
            <p className="text-2xl font-bold text-slate-600">{stats.proposed}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Proposed</p>
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
              <option value="2025-II">2025-II (Fall)</option>
              <option value="2025-I">2025-I (Spring)</option>
              <option value="2024-II">2024-II</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="E">Enrolling</option>
              <option value="R">Running</option>
              <option value="P">Proposed</option>
              <option value="F">Finished</option>
            </select>
          </div>
        </div>

        {/* Offerings List */}
        <div className="mt-6 space-y-3">
          {filteredOfferings.map((offering) => {
            const enrollmentPercent = (offering.enrolled / offering.capacity) * 100;
            return (
              <div
                key={offering.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {offering.courseCode} - Sec {offering.section}
                      </h3>
                      {getStatusBadge(offering.status)}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {offering.courseTitle}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {offering.session}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Slot: {offering.slot}
                      </span>
                      <span>{offering.department}</span>
                      <span>Coordinator: {offering.coordinator}</span>
                    </div>

                    {offering.instructors.length > 1 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-medium">Co-instructors:</span>
                        <span>{offering.instructors.filter((i) => i !== offering.coordinator).join(', ')}</span>
                      </div>
                    )}

                    {/* Enrollment Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">
                          <Users className="inline h-3.5 w-3.5" /> Enrollment
                        </span>
                        <span className="font-semibold text-indigo-600">
                          {offering.enrolled}/{offering.capacity} ({enrollmentPercent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                          style={{ width: `${enrollmentPercent}%` }}
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
          })}
        </div>

        {filteredOfferings.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600">No offerings found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
