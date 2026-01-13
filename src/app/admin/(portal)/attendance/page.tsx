'use client';

import { useState } from 'react';
import { Search, Filter, Calendar, Download, Users, CheckCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseTitle: string;
  section: string;
  session: string;
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  instructor: string;
}

export default function AttendanceManagementPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      courseCode: 'CS502',
      courseTitle: 'Data Structures and Algorithms',
      section: 'A',
      session: '2025-II',
      date: '2026-01-13',
      totalStudents: 45,
      present: 42,
      absent: 2,
      late: 1,
      percentage: 93.3,
      instructor: 'Dr. Rajesh Kumar',
    },
    {
      id: '2',
      courseCode: 'CS604',
      courseTitle: 'Advanced Operating Systems',
      section: 'B',
      session: '2025-II',
      date: '2026-01-13',
      totalStudents: 38,
      present: 30,
      absent: 6,
      late: 2,
      percentage: 78.9,
      instructor: 'Dr. Nitin Auluck',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('2025-II');
  const [dateFilter, setDateFilter] = useState('2026-01-13');

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSession = record.session === sessionFilter;
    const matchesDate = record.date === dateFilter;
    return matchesSearch && matchesSession && matchesDate;
  });

  const handleExportReport = () => {
    const csvContent = [
      'Course,Section,Date,Total,Present,Absent,Late,Percentage,Instructor',
      ...filteredRecords.map((r) =>
        [
          r.courseCode,
          r.section,
          r.date,
          r.totalStudents,
          r.present,
          r.absent,
          r.late,
          r.percentage.toFixed(1) + '%',
          r.instructor,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${sessionFilter}_${dateFilter}.csv`;
    a.click();
  };

  const stats = {
    totalClasses: records.length,
    avgAttendance: (records.reduce((sum, r) => sum + r.percentage, 0) / records.length).toFixed(1),
    totalPresent: records.reduce((sum, r) => sum + r.present, 0),
    totalAbsent: records.reduce((sum, r) => sum + r.absent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Attendance Oversight
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Attendance Management
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Monitor and analyze student attendance across all courses
            </p>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.totalClasses}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Classes Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.avgAttendance}%</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Avg Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalPresent}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Present</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Absent</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Attendance Records</h2>

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

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Course</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Section</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Total</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Present</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Absent</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Late</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Attendance %</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-indigo-50/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{record.courseCode}</p>
                      <p className="text-xs text-slate-600">{record.courseTitle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{record.section}</td>
                  <td className="px-4 py-3 text-slate-700">{record.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{record.totalStudents}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{record.present}</td>
                  <td className="px-4 py-3 font-semibold text-red-700">{record.absent}</td>
                  <td className="px-4 py-3 font-semibold text-orange-700">{record.late}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                          style={{ width: `${record.percentage}%` }}
                        />
                      </div>
                      <span className="font-semibold text-indigo-600">
                        {record.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
