'use client';

import { useState } from 'react';
import { Search, Filter, Upload, FileDown, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  session: string;
  grade: string;
  status: 'VER' | 'PND' | 'FRZ';
  instructor: string;
  submittedDate: string;
}

export default function GradeManagementPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([
    {
      id: '1',
      studentId: '2021CS001',
      studentName: 'Rahul Verma',
      program: 'M.Tech CS',
      courseCode: 'CS502',
      courseTitle: 'Data Structures and Algorithms',
      section: 'A',
      session: '2025-II',
      grade: 'A',
      status: 'VER',
      instructor: 'Dr. Rajesh Kumar',
      submittedDate: '2026-01-05',
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
      grade: 'B+',
      status: 'PND',
      instructor: 'Dr. Nitin Auluck',
      submittedDate: '2026-01-10',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('2025-II');

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || grade.status === statusFilter;
    const matchesSession = grade.session === sessionFilter;
    return matchesSearch && matchesStatus && matchesSession;
  });

  const handleVerifyGrade = (gradeId: string) => {
    setGrades(grades.map((g) => (g.id === gradeId ? { ...g, status: 'VER' as const } : g)));
  };

  const handleFreezeGrades = () => {
    if (confirm('Freeze all verified grades for this session? This action cannot be undone.')) {
      setGrades(grades.map((g) => (g.status === 'VER' ? { ...g, status: 'FRZ' as const } : g)));
      alert('Grades frozen successfully!');
    }
  };

  const handleGenerateTranscript = (studentId: string) => {
    alert(`Generating transcript for ${studentId}. PDF will be downloaded.`);
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert('Bulk grade upload will be integrated with backend API!');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'student_id,course_code,section,session,grade\n2021CS001,CS502,A,2025-II,A\n2021CS002,CS604,B,2025-II,B+';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_grade_template.csv';
    a.click();
  };

  const handleExportGrades = () => {
    const csvContent = [
      'Student ID,Name,Program,Course Code,Course Title,Section,Session,Grade,Status,Instructor,Date',
      ...filteredGrades.map((g) =>
        [
          g.studentId,
          g.studentName,
          g.program,
          g.courseCode,
          g.courseTitle,
          g.section,
          g.session,
          g.grade,
          g.status,
          g.instructor,
          g.submittedDate,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades_${sessionFilter}.csv`;
    a.click();
  };

  const getStatusBadge = (status: GradeRecord['status']) => {
    const styles = {
      VER: 'bg-green-100 text-green-800',
      PND: 'bg-orange-100 text-orange-800',
      FRZ: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      VER: 'Verified',
      PND: 'Pending',
      FRZ: 'Frozen',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: grades.length,
    verified: grades.filter((g) => g.status === 'VER').length,
    pending: grades.filter((g) => g.status === 'PND').length,
    frozen: grades.filter((g) => g.status === 'FRZ').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Grade Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Grade Verification & Transcripts
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Verify grades submitted by instructors and generate student transcripts
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportGrades}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileDown className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleFreezeGrades}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <AlertCircle className="h-4 w-4" />
              Freeze Grades
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Grades</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Verified</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Pending Verification</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.frozen}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Frozen</p>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Bulk Grade Operations</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload CSV to bulk verify grades or perform batch operations
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
            Upload Grades CSV
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Grade Records</h2>

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
              <option value="VER">Verified</option>
              <option value="PND">Pending</option>
              <option value="FRZ">Frozen</option>
            </select>
          </div>
        </div>

        {/* Grades Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Student</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Program</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Course</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Section</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Grade</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Instructor</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-indigo-50/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{grade.studentName}</p>
                      <p className="text-xs text-slate-600">{grade.studentId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{grade.program}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{grade.courseCode}</p>
                      <p className="text-xs text-slate-600">{grade.courseTitle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{grade.section}</td>
                  <td className="px-4 py-3">
                    <span className="text-lg font-bold text-green-700">{grade.grade}</span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(grade.status)}</td>
                  <td className="px-4 py-3 text-slate-600">{grade.instructor}</td>
                  <td className="px-4 py-3 text-slate-600">{grade.submittedDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {grade.status === 'PND' && (
                        <button
                          onClick={() => handleVerifyGrade(grade.id)}
                          className="rounded-lg bg-green-600 p-1.5 text-white transition hover:bg-green-700"
                          title="Verify"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateTranscript(grade.studentId)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        title="Generate Transcript"
                      >
                        <FileText className="inline h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGrades.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600">No grade records found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
