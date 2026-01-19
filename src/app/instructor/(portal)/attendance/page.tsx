'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Download, TrendingUp, Search } from 'lucide-react';

interface Student {
  id: string;
  rollNo: string;
  name: string;
  attendance: { [date: string]: 'present' | 'absent' | 'late' };
  percentage: number;
}

interface Course {
  id: string;
  code: string;
  title: string;
  students: number;
}

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadStudents();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await fetch(`/api/attendance?offeringId=${selectedCourse}`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      rollNo: '2021CSB1111',
      name: 'Rahul Sharma',
      attendance: {
        '2026-01-13': 'present',
        '2026-01-10': 'present',
        '2026-01-08': 'absent',
      },
      percentage: 92,
    },
    {
      id: '2',
      rollNo: '2021CSB1155',
      name: 'Priya Patel',
      attendance: {
        '2026-01-13': 'present',
        '2026-01-10': 'present',
        '2026-01-08': 'present',
      },
      percentage: 98,
    },
    {
      id: '3',
      rollNo: '2021CSB1089',
      name: 'Amit Kumar',
      attendance: {
        '2026-01-13': 'absent',
        '2026-01-10': 'late',
        '2026-01-08': 'present',
      },
      percentage: 85,
    },
    {
      id: '4',
      rollNo: '2021CSB1234',
      name: 'Sneha Singh',
      attendance: {
        '2026-01-13': 'present',
        '2026-01-10': 'present',
        '2026-01-08': 'late',
      },
      percentage: 95,
    },
  ]);

  const handleAttendanceChange = (
    studentId: string,
    status: 'present' | 'absent' | 'late'
  ) => {
    setStudents(
      students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              attendance: { ...s.attendance, [selectedDate]: status },
            }
          : s
      )
    );
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setStudents(
      students.map((s) => ({
        ...s,
        attendance: { ...s.attendance, [selectedDate]: status },
      }))
    );
  };

  const handleDownloadReport = () => {
    // CSV download logic (will be integrated with backend)
    const csvContent = students
      .map((s) => `${s.rollNo},${s.name},${s.percentage}%`)
      .join('\n');
    const blob = new Blob([`ROLL_NO,NAME,ATTENDANCE\n${csvContent}`], {
      type: 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCourse || 'course'}_attendance_report.csv`;
    a.click();
  };

  const filteredStudents = students.filter(
    (student) =>
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayStats = {
    present: filteredStudents.filter(
      (s) => s.attendance[selectedDate] === 'present'
    ).length,
    absent: filteredStudents.filter(
      (s) => s.attendance[selectedDate] === 'absent'
    ).length,
    late: filteredStudents.filter(
      (s) => s.attendance[selectedDate] === 'late'
    ).length,
  };

  const avgAttendance =
    students.reduce((sum, s) => sum + s.percentage, 0) / students.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Attendance Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Mark & Track Attendance
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Mark attendance for your classes and view attendance reports
        </p>

        {/* Course Selector */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.code}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Select Date
            </label>
            <div className="relative mt-2">
              <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {selectedCourse && (
          <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {todayStats.present}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Present Today
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Absent Today
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{todayStats.late}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">Late Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {avgAttendance.toFixed(1)}%
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Avg. Attendance
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedCourse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Student Attendance</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMarkAll('present')}
                className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
              >
                Mark All Present
              </button>
              <button
                onClick={() => handleMarkAll('absent')}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Mark All Absent
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Report
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by roll number or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    S#
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Roll No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Overall %
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Today&apos;s Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {student.rollNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            student.percentage >= 90
                              ? 'text-green-600'
                              : student.percentage >= 75
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }`}
                        >
                          {student.percentage}%
                        </span>
                        <TrendingUp
                          className={`h-4 w-4 ${
                            student.percentage >= 75
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, 'present')
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            student.attendance[selectedDate] === 'present'
                              ? 'bg-green-600 text-white'
                              : 'border border-green-300 bg-white text-green-700 hover:bg-green-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, 'late')
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            student.attendance[selectedDate] === 'late'
                              ? 'bg-orange-600 text-white'
                              : 'border border-orange-300 bg-white text-orange-700 hover:bg-orange-50'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, 'absent')
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            student.attendance[selectedDate] === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'border border-red-300 bg-white text-red-700 hover:bg-red-50'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <button className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Save Draft
            </button>
            <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
              Submit Attendance
            </button>
          </div>
        </div>
      )}

      {!selectedCourse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No Course Selected
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Please select a course from the dropdown above to mark attendance.
          </p>
        </div>
      )}
    </div>
  );
}
