'use client';

import { useState } from 'react';
import { Search, Filter, Upload, CheckCircle, X, FileDown, Users } from 'lucide-react';

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  session: string;
  status: 'ENR' | 'PND' | 'REJ' | 'WDN' | 'CAN';
  enrolledDate: string;
  grade?: string;
}

export default function EnrollmentManagementPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([
    {
      id: '1',
      studentId: '2021CS001',
      studentName: 'Rahul Verma',
      program: 'M.Tech CS',
      courseCode: 'CS502',
      courseTitle: 'Data Structures and Algorithms',
      section: 'A',
      session: '2025-II',
      status: 'ENR',
      enrolledDate: '2025-12-01',
      grade: 'A',
    },
    {
      id: '2',
      studentId: '2021CS015',
      studentName: 'Priya Sharma',
      program: 'M.Tech CS',
      courseCode: 'CS604',
      courseTitle: 'Advanced Operating Systems',
      section: 'B',
      session: '2025-II',
      status: 'ENR',
      enrolledDate: '2025-12-02',
    },
    {
      id: '3',
      studentId: '2022EE005',
      studentName: 'Amit Kumar',
      program: 'M.Tech EE',
      courseCode: 'CS502',
      courseTitle: 'Data Structures and Algorithms',
      section: 'A',
      session: '2025-II',
      status: 'PND',
      enrolledDate: '2026-01-10',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('2025-II');

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch =
      enrollment.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enrollment.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesSession = enrollment.session === sessionFilter;
    return matchesSearch && matchesStatus && matchesSession;
  });

  const handleApprove = (enrollmentId: string) => {
    setEnrollments(
      enrollments.map((e) => (e.id === enrollmentId ? { ...e, status: 'ENR' as const } : e))
    );
  };

  const handleReject = (enrollmentId: string) => {
    setEnrollments(
      enrollments.map((e) => (e.id === enrollmentId ? { ...e, status: 'REJ' as const } : e))
    );
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert('Bulk enrollment upload will be integrated with backend API!');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'student_id,course_code,section,session\n2021CS001,CS502,A,2025-II\n2021CS002,CS604,B,2025-II';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_enrollment_template.csv';
    a.click();
  };

  const handleExportEnrollments = () => {
    const csvContent = [
      'Student ID,Name,Program,Course Code,Course Title,Section,Session,Status,Grade',
      ...filteredEnrollments.map((e) =>
        [
          e.studentId,
          e.studentName,
          e.program,
          e.courseCode,
          e.courseTitle,
          e.section,
          e.session,
          e.status,
          e.grade || '-',
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments_${sessionFilter}.csv`;
    a.click();
  };

  const getStatusBadge = (status: Enrollment['status']) => {
    const styles = {
      ENR: 'bg-green-100 text-green-800',
      PND: 'bg-orange-100 text-orange-800',
      REJ: 'bg-indigo-100 text-indigo-800',
      WDN: 'bg-slate-100 text-slate-600',
      CAN: 'bg-indigo-100 text-indigo-800',
    };
    const labels = {
      ENR: 'Enrolled',
      PND: 'Pending',
      REJ: 'Rejected',
      WDN: 'Withdrawn',
      CAN: 'Canceled',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: enrollments.length,
    enrolled: enrollments.filter((e) => e.status === 'ENR').length,
    pending: enrollments.filter((e) => e.status === 'PND').length,
    rejected: enrollments.filter((e) => e.status === 'REJ').length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-white p-4 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Enrollment Management
            </p>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Manage Course Enrollments
            </h1>
            <p className="mt-2 md:mt-3 text-sm leading-relaxed text-slate-600">
              Approve, reject, and manage student course enrollments
            </p>
          </div>
          <button
            onClick={handleExportEnrollments}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 md:px-6 py-2.5 md:py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FileDown className="h-4 w-4" />
            Export Enrollments
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Enrollments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.enrolled}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Enrolled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Pending Approval</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.rejected}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Rejected</p>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-bold text-slate-900">Bulk Enrollment Operations</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload CSV to bulk enroll students or perform batch operations
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
            Upload Enrollments CSV
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl md:rounded-2xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-bold text-slate-900">Enrollment Records</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student ID, name, or course code..."
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
              <option value="ENR">Enrolled</option>
              <option value="PND">Pending</option>
              <option value="REJ">Rejected</option>
              <option value="WDN">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Enrollments Table - Desktop and Mobile Views */}
        <div className="mt-4 md:mt-6">
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filteredEnrollments.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-2 text-sm text-slate-600">No enrollments found matching your filters.</p>
              </div>
            ) : (
              filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-900">
                        {enrollment.studentName}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-600">{enrollment.studentId}</p>
                    </div>
                    {getStatusBadge(enrollment.status)}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold text-slate-700">Course</p>
                        <p className="mt-0.5 text-slate-900">{enrollment.courseCode}</p>
                        <p className="text-slate-600">{enrollment.courseTitle}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Program</p>
                        <p className="mt-0.5 text-slate-600">{enrollment.program}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="font-semibold text-slate-700">Section</p>
                        <p className="mt-0.5 text-slate-600">{enrollment.section}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Grade</p>
                        <p className="mt-0.5">
                          {enrollment.grade ? (
                            <span className="font-bold text-green-700">{enrollment.grade}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">Date</p>
                        <p className="mt-0.5 text-slate-600">{enrollment.enrolledDate}</p>
                      </div>
                    </div>
                  </div>

                  {enrollment.status === 'PND' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(enrollment.id)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(enrollment.id)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  {enrollment.status === 'ENR' && (
                    <button className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                      View Details
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Student</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Program</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Course</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Section</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Grade</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-600">No enrollments found matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-indigo-50/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-900">{enrollment.studentName}</p>
                          <p className="text-xs text-slate-600">{enrollment.studentId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{enrollment.program}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-slate-900">{enrollment.courseCode}</p>
                          <p className="text-xs text-slate-600">{enrollment.courseTitle}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{enrollment.section}</td>
                      <td className="px-4 py-3">{getStatusBadge(enrollment.status)}</td>
                      <td className="px-4 py-3">
                        {enrollment.grade ? (
                          <span className="font-bold text-green-700">{enrollment.grade}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{enrollment.enrolledDate}</td>
                      <td className="px-4 py-3">
                        {enrollment.status === 'PND' && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(enrollment.id)}
                              className="rounded-lg bg-green-600 p-1.5 text-white transition hover:bg-green-700"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(enrollment.id)}
                              className="rounded-lg bg-red-600 p-1.5 text-white transition hover:bg-red-700"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {enrollment.status === 'ENR' && (
                          <div className="flex items-center justify-center">
                            <button className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                              View
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
