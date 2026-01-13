'use client';

import { useState } from 'react';
import { Search, Filter, Mail, Phone, TrendingUp, Download } from 'lucide-react';

interface Student {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  attendance: number;
  grade: string;
  status: 'active' | 'dropped' | 'on_leave';
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [students] = useState<Student[]>([
    {
      id: '1',
      rollNo: '2021CSB1111',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@iitrpr.ac.in',
      phone: '+91 98765 43210',
      course: 'CS502',
      attendance: 92,
      grade: 'A',
      status: 'active',
    },
    {
      id: '2',
      rollNo: '2021CSB1155',
      name: 'Priya Patel',
      email: 'priya.patel@iitrpr.ac.in',
      phone: '+91 98765 43211',
      course: 'CS502',
      attendance: 98,
      grade: 'A-',
      status: 'active',
    },
    {
      id: '3',
      rollNo: '2021CSB1089',
      name: 'Amit Kumar',
      email: 'amit.kumar@iitrpr.ac.in',
      phone: '+91 98765 43212',
      course: 'CS604',
      attendance: 85,
      grade: 'B+',
      status: 'active',
    },
    {
      id: '4',
      rollNo: '2021CSB1234',
      name: 'Sneha Singh',
      email: 'sneha.singh@iitrpr.ac.in',
      phone: '+91 98765 43213',
      course: 'CS604',
      attendance: 95,
      grade: 'A',
      status: 'active',
    },
    {
      id: '5',
      rollNo: '2021CSB1167',
      name: 'Vikram Mehta',
      email: 'vikram.m@iitrpr.ac.in',
      phone: '+91 98765 43214',
      course: 'CS701',
      attendance: 88,
      grade: 'A',
      status: 'active',
    },
    {
      id: '6',
      rollNo: '2021CSB1200',
      name: 'Anita Desai',
      email: 'anita.desai@iitrpr.ac.in',
      phone: '+91 98765 43215',
      course: 'CS701',
      attendance: 72,
      grade: 'B',
      status: 'dropped',
    },
  ]);

  const courses = ['CS502', 'CS604', 'CS701'];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const getStatusBadge = (status: Student['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      dropped: 'bg-red-100 text-red-800 border-red-200',
      on_leave: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    const labels = {
      active: 'Active',
      dropped: 'Dropped',
      on_leave: 'On Leave',
    };
    return (
      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const handleExportCSV = () => {
    const csvContent = filteredStudents
      .map((s) => `${s.rollNo},${s.name},${s.email},${s.course},${s.attendance}%,${s.grade}`)
      .join('\n');
    const blob = new Blob([`Roll No,Name,Email,Course,Attendance,Grade\n${csvContent}`], {
      type: 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_list.csv';
    a.click();
  };

  const stats = {
    total: students.filter((s) => s.status === 'active').length,
    avgAttendance:
      students.reduce((sum, s) => sum + s.attendance, 0) / students.length || 0,
    highPerformers: students.filter((s) => s.grade.startsWith('A')).length,
    atRisk: students.filter((s) => s.attendance < 75).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Student Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              My Students
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              View and manage students enrolled in your courses
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Active Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.avgAttendance.toFixed(0)}%
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">Avg. Attendance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.highPerformers}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">High Performers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.atRisk}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">At Risk</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by roll number, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="dropped">Dropped</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Student List ({filteredStudents.length})
        </h2>

        <div className="mt-4 space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                    {student.name.split(' ').map((n) => n[0]).join('')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                      {getStatusBadge(student.status)}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {student.rollNo}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {student.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex shrink-0 gap-6">
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-500">Course</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {student.course}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-500">Attendance</p>
                    <div className="mt-1 flex items-center gap-1">
                      <p
                        className={`text-sm font-bold ${
                          student.attendance >= 90
                            ? 'text-green-600'
                            : student.attendance >= 75
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {student.attendance}%
                      </p>
                      <TrendingUp
                        className={`h-3.5 w-3.5 ${
                          student.attendance >= 75 ? 'text-green-500' : 'text-red-500'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-slate-500">Grade</p>
                    <p className="mt-1 text-sm font-bold text-indigo-600">
                      {student.grade}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600">No students found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
