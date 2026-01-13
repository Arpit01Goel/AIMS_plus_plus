'use client';

import { useState } from 'react';
import { Search, Filter, Upload, Plus, Edit, CheckCircle, X, FileText } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  code: string;
  title: string;
  ltp: string;
  credits: number;
  department: string;
  status: 'DRA' | 'APP' | 'HAP' | 'HAR' | 'CAP' | 'CAR' | 'RET';
  author: string;
  lastUpdated: string;
}

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      code: 'CS502',
      title: 'Data Structures and Algorithms',
      ltp: '3-1-0-6-4',
      credits: 4,
      department: 'Computer Science',
      status: 'APP',
      author: 'Dr. Rajesh Kumar',
      lastUpdated: '2025-12-15',
    },
    {
      id: '2',
      code: 'CS604',
      title: 'Advanced Operating Systems',
      ltp: '3-0-0-6-3',
      credits: 3,
      department: 'Computer Science',
      status: 'APP',
      author: 'Dr. Nitin Auluck',
      lastUpdated: '2025-11-20',
    },
    {
      id: '3',
      code: 'CS801',
      title: 'Advanced Machine Learning',
      ltp: '3-0-2-4-4',
      credits: 4,
      department: 'Computer Science',
      status: 'HAP',
      author: 'Dr. Amit Singh',
      lastUpdated: '2026-01-10',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesDept = deptFilter === 'all' || course.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert('Bulk course upload will be integrated with backend API!');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'code,title,ltp\nCS999,Sample Course,3-1-0\nEE101,Circuit Theory,3-0-2';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_course_template.csv';
    a.click();
  };

  const handleApprove = (courseId: string) => {
    setCourses(
      courses.map((c) => (c.id === courseId ? { ...c, status: 'APP' as const } : c))
    );
  };

  const handleReject = (courseId: string) => {
    setCourses(
      courses.map((c) => (c.id === courseId ? { ...c, status: 'HAR' as const } : c))
    );
  };

  const getStatusBadge = (status: Course['status']) => {
    const styles = {
      DRA: 'bg-slate-100 text-slate-800',
      APP: 'bg-green-100 text-green-800',
      HAP: 'bg-orange-100 text-orange-800',
      HAR: 'bg-indigo-100 text-indigo-800',
      CAP: 'bg-yellow-100 text-yellow-800',
      CAR: 'bg-indigo-100 text-indigo-800',
      RET: 'bg-slate-100 text-slate-500',
    };
    const labels = {
      DRA: 'Draft',
      APP: 'Approved',
      HAP: 'HoD Pending',
      HAR: 'HoD Rejected',
      CAP: 'Council Pending',
      CAR: 'Council Rejected',
      RET: 'Retired',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: courses.length,
    approved: courses.filter((c) => c.status === 'APP').length,
    pending: courses.filter((c) => ['HAP', 'CAP'].includes(c.status)).length,
    draft: courses.filter((c) => c.status === 'DRA').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Course Catalog
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Course Catalog
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Create, edit, and approve courses in the academic catalog
            </p>
          </div>
          <Link
            href="/admin/courses/create"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Courses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Pending Approval</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">{stats.draft}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Drafts</p>
          </div>
        </div>
      </div>

      {/* Bulk Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Bulk Course Upload</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload CSV file to create multiple courses. System auto-calculates Study hours and Credits from LTP.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <Upload className="h-5 w-5" />
            Download CSV Template
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100">
            <Upload className="h-5 w-5" />
            Upload Courses CSV
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Auto-Calculation Logic:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
            <li>Input: L-T-P (e.g., 3-1-2)</li>
            <li>Study Hours (S) = 2*L - T + 0.5*P = 2*3 - 1 + 0.5*2 = 6</li>
            <li>Credits (C) = L + 0.5*P = 3 + 0.5*2 = 4</li>
            <li>Output: L-T-P-S-C (e.g., 3-1-2-6-4)</li>
          </ul>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Course Catalog</h2>

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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="APP">Approved</option>
              <option value="HAP">HoD Pending</option>
              <option value="CAP">Council Pending</option>
              <option value="DRA">Draft</option>
              <option value="RET">Retired</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Course Cards */}
        <div className="mt-6 space-y-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                    <FileText className="h-7 w-7 text-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{course.code}</h3>
                      {getStatusBadge(course.status)}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">{course.title}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span className="font-medium">LTP-S-C: {course.ltp}</span>
                      <span>{course.credits} Credits</span>
                      <span>{course.department}</span>
                      <span>By: {course.author}</span>
                      <span>Updated: {course.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  {['HAP', 'CAP'].includes(course.status) && (
                    <>
                      <button
                        onClick={() => handleApprove(course.id)}
                        className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(course.id)}
                        className="flex items-center gap-2 rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600">No courses found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
