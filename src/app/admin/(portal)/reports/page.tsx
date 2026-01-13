'use client';

import { useState } from 'react';
import { FileDown, BarChart3, Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';

type ReportType = 'enrollment' | 'performance' | 'credits' | 'attendance' | 'faculty' | 'course';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('enrollment');
  const [session, setSession] = useState('2025-II');
  const [department, setDepartment] = useState('all');
  const [program, setProgram] = useState('all');

  const reportTypes = [
    {
      id: 'enrollment' as ReportType,
      title: 'Enrollment Report',
      description: 'Student enrollments by session, program, and course',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'performance' as ReportType,
      title: 'Performance Report',
      description: 'Grade distribution and student performance metrics',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'credits' as ReportType,
      title: 'Credits Report',
      description: 'Credit completion status and progress tracking',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'attendance' as ReportType,
      title: 'Attendance Report',
      description: 'Attendance statistics by course and student',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'faculty' as ReportType,
      title: 'Faculty Report',
      description: 'Instructor teaching load and course distribution',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      id: 'course' as ReportType,
      title: 'Course Report',
      description: 'Course offerings, sections, and enrollment capacity',
      icon: BarChart3,
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const generateReport = () => {
    alert(
      `Generating ${reportTypes.find((r) => r.id === selectedReport)?.title} for ${session}. PDF will be downloaded.`
    );
  };

  const exportToExcel = () => {
    alert('Exporting to Excel. File will be downloaded.');
  };

  // Sample data for preview
  const enrollmentData = [
    { program: 'M.Tech CS', enrolled: 45, capacity: 60, percentage: 75 },
    { program: 'M.Tech EE', enrolled: 38, capacity: 50, percentage: 76 },
    { program: 'PhD CS', enrolled: 12, capacity: 20, percentage: 60 },
  ];

  const performanceData = [
    { grade: 'A+', count: 15, percentage: 15 },
    { grade: 'A', count: 25, percentage: 25 },
    { grade: 'B+', count: 30, percentage: 30 },
    { grade: 'B', count: 20, percentage: 20 },
    { grade: 'C', count: 10, percentage: 10 },
  ];

  const creditsData = [
    { student: '2021CS001', required: 32, earned: 28, remaining: 4, progress: 87.5 },
    { student: '2021CS015', required: 32, earned: 32, remaining: 0, progress: 100 },
    { student: '2022EE005', required: 36, earned: 24, remaining: 12, progress: 66.7 },
  ];

  const attendanceData = [
    { course: 'CS502-A', totalClasses: 40, avgAttendance: 85 },
    { course: 'CS604-B', totalClasses: 38, avgAttendance: 78 },
    { course: 'CS801-A', totalClasses: 42, avgAttendance: 92 },
  ];

  const renderPreview = () => {
    switch (selectedReport) {
      case 'enrollment':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Enrollment Summary - {session}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Program</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Enrolled</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Capacity</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollmentData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.program}</td>
                      <td className="px-4 py-3 text-slate-700">{row.enrolled}</td>
                      <td className="px-4 py-3 text-slate-700">{row.capacity}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${row.percentage}%` }}
                            />
                          </div>
                          <span className="font-semibold text-blue-600">{row.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Grade Distribution - {session}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Grade</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Count</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Percentage</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performanceData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-lg font-bold text-green-700">{row.grade}</td>
                      <td className="px-4 py-3 text-slate-700">{row.count}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.percentage}%</td>
                      <td className="px-4 py-3">
                        <div className="h-2 w-full rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${row.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'credits':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Credit Completion Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Student ID</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Required</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Earned</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Remaining</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {creditsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.student}</td>
                      <td className="px-4 py-3 text-slate-700">{row.required}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">{row.earned}</td>
                      <td className="px-4 py-3 text-slate-700">{row.remaining}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                          <span className="font-semibold text-purple-600">
                            {row.progress.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Attendance Statistics - {session}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700">Course</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Total Classes</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Avg Attendance</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{row.course}</td>
                      <td className="px-4 py-3 text-slate-700">{row.totalClasses}</td>
                      <td className="px-4 py-3 font-semibold text-orange-600">
                        {row.avgAttendance}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.avgAttendance >= 85
                              ? 'bg-green-100 text-green-800'
                              : row.avgAttendance >= 75
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {row.avgAttendance >= 85
                            ? 'Good'
                            : row.avgAttendance >= 75
                              ? 'Average'
                              : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'faculty':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Faculty Teaching Load - {session}</h3>
            <p className="text-sm text-slate-600">
              Faculty workload report showing courses taught, students enrolled, and teaching hours.
            </p>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">Report includes:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
                <li>Instructor name and department</li>
                <li>Number of courses taught</li>
                <li>Total students enrolled across all courses</li>
                <li>Weekly teaching hours (L-T-P breakdown)</li>
                <li>Co-instructor collaborations</li>
              </ul>
            </div>
          </div>
        );

      case 'course':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Course Offerings Report - {session}</h3>
            <p className="text-sm text-slate-600">
              Comprehensive report of course offerings with sections, capacity, and enrollments.
            </p>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-900">Report includes:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-indigo-800">
                <li>Course code and title</li>
                <li>Number of sections offered</li>
                <li>Total capacity vs enrolled students</li>
                <li>Slot assignments and timings</li>
                <li>Instructor assignments</li>
                <li>Department-wise distribution</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Academic Reports
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Generate Reports
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Generate comprehensive academic reports for enrollments, performance, and analytics
          </p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Select Report Type</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  selectedReport === report.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{report.title}</h3>
                    <p className="mt-1 text-xs text-slate-600">{report.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Report Filters</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="2025-II">2025-II (Fall)</option>
              <option value="2025-I">2025-I (Spring)</option>
              <option value="2024-II">2024-II</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              <option value="cs">Computer Science</option>
              <option value="ee">Electrical Engineering</option>
              <option value="me">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Program</label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Programs</option>
              <option value="mtech">M.Tech</option>
              <option value="phd">PhD</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={generateReport}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FileDown className="h-4 w-4" />
            Generate PDF Report
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-xl border border-green-600 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            <FileDown className="h-4 w-4" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Report Preview</h2>
        <div className="mt-4">{renderPreview()}</div>
      </div>
    </div>
  );
}
