'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, AlertCircle, Mail, BookOpen } from 'lucide-react';

interface Student {
  id: string;
  entryNumber: string;
  name: string;
  email: string;
  program: string;
  enrollmentType: string;
  status: string;
  grade: string | null;
  attendance: number;
}

interface CourseInfo {
  code: string;
  title: string;
  session: string;
  capacity: number;
  enrolled: number;
  credits?: number;
  department?: string;
}

export default function CourseStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${courseId}/students`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to load data');

      setCourse(json.course);
      setStudents(json.students);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const search = searchQuery.toLowerCase();
    return (
      s.entryNumber.toLowerCase().includes(search) ||
      s.name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.program.toLowerCase().includes(search)
    );
  });

  const enrolled = filtered.filter((s) => s.status === 'ENROLLED');
  const pending = filtered.filter((s) =>
    ['PENDING_INSTRUCTOR_APPROVAL', 'PENDING_ADVISOR_APPROVAL'].includes(s.status)
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      ENROLLED: { bg: 'bg-green-100 text-green-800', label: 'Enrolled' },
      PENDING_INSTRUCTOR_APPROVAL: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PENDING_ADVISOR_APPROVAL: { bg: 'bg-orange-100 text-orange-800', label: 'Advisor Review' },
      WITHDRAWN_BY_STUDENT: { bg: 'bg-slate-100 text-slate-800', label: 'Withdrawn' },
    };

    const { bg, label } = config[status] || { bg: 'bg-gray-100 text-gray-800', label: status };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${bg}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error loading students</h3>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={loadData}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Retry
          </button>
          <Link
            href="/instructor/courses"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/instructor/courses"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        {course && (
          <div className="mt-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {course.code} - {course.title}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {course.department} • {course.session} • {course.credits} Credits
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{enrolled.length}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Enrolled Students</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Pending Approval</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-600">{students.length}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Total Students</p>
              </div>
            </div>

            {/* Search */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search by entry number, name, email, or program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Students List */}
      {filtered.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Users className="h-5 w-5" />
            Students ({filtered.length})
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 font-semibold text-slate-700">Entry Number</th>
                  <th className="pb-3 font-semibold text-slate-700">Name</th>
                  <th className="pb-3 font-semibold text-slate-700">Program</th>
                  <th className="pb-3 font-semibold text-slate-700">Attendance</th>
                  <th className="pb-3 font-semibold text-slate-700">Type</th>
                  <th className="pb-3 font-semibold text-slate-700">Status</th>
                  <th className="pb-3 font-semibold text-slate-700">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((student, index) => (
                  <tr key={`${student.id}-${student.entryNumber}-${index}`} className="hover:bg-slate-50">
                    <td className="py-3 font-mono text-slate-900">{student.entryNumber}</td>
                    <td className="py-3 font-medium text-slate-900">{student.name}</td>
                    <td className="py-3 text-slate-600">{student.program}</td>
                    <td className="py-3 text-slate-600">{student.attendance?.toFixed(1)}%</td>
                    <td className="py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {student.enrollmentType}
                      </span>
                    </td>
                    <td className="py-3">{getStatusBadge(student.status)}</td>
                    <td className="py-3">
                      <a
                        href={`mailto:${student.email}`}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No students found</h3>
          <p className="mt-2 text-sm text-slate-600">
            {searchQuery ? 'Try adjusting your search query' : 'No students enrolled yet'}
          </p>
        </div>
      )}
    </div>
  );
}
