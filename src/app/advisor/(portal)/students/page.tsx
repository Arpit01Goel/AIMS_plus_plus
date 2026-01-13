'use client';

import { useState } from 'react';
import { Search, Filter, Download, Mail, TrendingUp, TrendingDown, Users, Award } from 'lucide-react';

interface Student {
  id: string;
  orgId: string;
  name: string;
  email: string;
  cgpa: number;
  creditsEarned: number;
  creditsRequired: number;
  currentEnrollments: number;
  status: 'active' | 'warning' | 'critical';
  lastSemesterSGPA: number;
  trend: 'up' | 'down' | 'stable';
}

export default function BatchStudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      orgId: '2021CS001',
      name: 'Rahul Verma',
      email: 'rahul.verma@iitrpr.ac.in',
      cgpa: 3.85,
      creditsEarned: 48,
      creditsRequired: 120,
      currentEnrollments: 5,
      status: 'active',
      lastSemesterSGPA: 9.0,
      trend: 'up',
    },
    {
      id: '2',
      orgId: '2021CS015',
      name: 'Priya Sharma',
      email: 'priya.sharma@iitrpr.ac.in',
      cgpa: 3.92,
      creditsEarned: 52,
      creditsRequired: 120,
      currentEnrollments: 4,
      status: 'active',
      lastSemesterSGPA: 9.5,
      trend: 'up',
    },
    {
      id: '3',
      orgId: '2021CS022',
      name: 'Amit Kumar',
      email: 'amit.kumar@iitrpr.ac.in',
      cgpa: 3.68,
      creditsEarned: 44,
      creditsRequired: 120,
      currentEnrollments: 6,
      status: 'warning',
      lastSemesterSGPA: 8.2,
      trend: 'down',
    },
    {
      id: '4',
      orgId: '2021CS034',
      name: 'Sneha Patel',
      email: 'sneha.patel@iitrpr.ac.in',
      cgpa: 4.0,
      creditsEarned: 56,
      creditsRequired: 120,
      currentEnrollments: 4,
      status: 'active',
      lastSemesterSGPA: 10.0,
      trend: 'stable',
    },
    {
      id: '5',
      orgId: '2021CS047',
      name: 'Vikram Singh',
      email: 'vikram.singh@iitrpr.ac.in',
      cgpa: 3.55,
      creditsEarned: 40,
      creditsRequired: 120,
      currentEnrollments: 5,
      status: 'warning',
      lastSemesterSGPA: 7.8,
      trend: 'down',
    },
    {
      id: '6',
      orgId: '2021CS053',
      name: 'Anjali Desai',
      email: 'anjali.desai@iitrpr.ac.in',
      cgpa: 3.78,
      creditsEarned: 46,
      creditsRequired: 120,
      currentEnrollments: 4,
      status: 'active',
      lastSemesterSGPA: 8.5,
      trend: 'up',
    },
    {
      id: '7',
      orgId: '2021CS061',
      name: 'Karan Mehta',
      email: 'karan.mehta@iitrpr.ac.in',
      cgpa: 3.25,
      creditsEarned: 38,
      creditsRequired: 120,
      currentEnrollments: 3,
      status: 'critical',
      lastSemesterSGPA: 6.5,
      trend: 'down',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.orgId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
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
    active: students.filter((s) => s.status === 'active').length,
    warning: students.filter((s) => s.status === 'warning').length,
    critical: students.filter((s) => s.status === 'critical').length,
    avgCGPA: (students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2),
  };

  const getStatusBadge = (status: Student['status']) => {
    if (status === 'active')
      return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Active</span>;
    if (status === 'warning')
      return <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">Warning</span>;
    return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Critical</span>;
  };

  const getTrendIcon = (trend: Student['trend']) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const exportToCSV = () => {
    const headers = ['Org ID', 'Name', 'Email', 'CGPA', 'Credits Earned', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.orgId,
      s.name,
      s.email,
      s.cgpa.toFixed(2),
      `${s.creditsEarned}/${s.creditsRequired}`,
      s.status,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sendBatchEmail = () => {
    alert(`Email sent to ${filteredStudents.length} students.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Batch Management
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Batch Students
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Computer Science • M.Tech • 2021 Entry Batch
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

      {/* Students List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                  CGPA
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                  Credits
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enrollments
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                  Last SGPA
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-900">{student.name}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">{student.orgId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg font-bold text-slate-900">{student.cgpa.toFixed(2)}</span>
                      {getTrendIcon(student.trend)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>
                      <p className="font-semibold text-slate-900">{student.creditsEarned}</p>
                      <p className="text-xs text-slate-600">/ {student.creditsRequired}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-sm font-semibold text-blue-800">
                      {student.currentEnrollments}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <p className="font-semibold text-slate-900">{student.lastSemesterSGPA.toFixed(1)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">{getStatusBadge(student.status)}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700">
                      View Details
                    </button>
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
