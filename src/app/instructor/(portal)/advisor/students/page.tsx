'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Mail, Users, Loader2 } from 'lucide-react';

interface Student {
  id: string;
  orgId: string;
  name: string;
  email: string;
  batch: number | null;
  program: string;
  department: string;
  cgpa: number;
  creditsEarned: number;
  currentEnrollments: number;
  phone?: string;
  address?: string;
}

export default function BatchStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/advisor/students');
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      setStudents(data.students);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const status = student.cgpa >= 7.0 ? 'active' : student.cgpa >= 6.0 ? 'warning' : 'critical';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'cgpa') return b.cgpa - a.cgpa;
      if (sortBy === 'credits') return b.creditsEarned - a.creditsEarned;
      return 0;
    });

  const stats = {
    total: students.length,
    active: students.filter(s => s.cgpa >= 7.0).length,
    warning: students.filter(s => s.cgpa >= 6.0 && s.cgpa < 7.0).length,
    critical: students.filter(s => s.cgpa < 6.0).length,
    avgCGPA: students.length > 0 
      ? (students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2)
      : '0.00',
  };

  const getStatusBadge = (cgpa: number) => {
    if (cgpa >= 7.0) {
      return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Active</span>;
    } else if (cgpa >= 6.0) {
      return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">Warning</span>;
    }
    return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Critical</span>;
  };

  const exportToCSV = () => {
    const headers = ['Entry Number', 'Name', 'Email', 'CGPA', 'Credits Earned', 'Current Enrollments', 'Program'];
    const rows = filteredStudents.map(s => [
      s.orgId,
      s.name,
      s.email,
      s.cgpa,
      s.creditsEarned,
      s.currentEnrollments,
      s.program,
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const sendBatchEmail = () => {
    alert(`Email would be sent to ${filteredStudents.length} students.`);
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
          onClick={fetchStudents}
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
            Batch Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            My Students
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            All students under your advisement
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Warning</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.avgCGPA}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Avg CGPA</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="name">Sort by Name</option>
              <option value="cgpa">Sort by CGPA</option>
              <option value="credits">Sort by Credits</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={sendBatchEmail}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Entry Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Program
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  CGPA
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Credits
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Current Enrollments
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-600">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {student.orgId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {student.program}
                    <br />
                    <span className="text-xs text-slate-500">{student.department}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-slate-900">{student.cgpa.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-700">
                    {student.creditsEarned}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                      {student.currentEnrollments}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(student.cgpa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
