'use client';

import { useState } from 'react';
import { Search, GraduationCap, Plus, Eye, CheckCircle, X, Users, Calendar } from 'lucide-react';

interface PhDStudent {
  id: string;
  studentId: string;
  name: string;
  supervisor: string;
  cosupervisor?: string;
  department: string;
  admissionYear: string;
  stage: 'coursework' | 'comprehensive' | 'research' | 'thesis' | 'defense';
  dcStatus: 'pending' | 'approved' | 'rejected';
  creditsCompleted: number;
  creditsRequired: number;
}

export default function PhDManagementPage() {
  const [students, setStudents] = useState<PhDStudent[]>([
    {
      id: '1',
      studentId: 'PHD2021CS001',
      name: 'Arjun Sharma',
      supervisor: 'Dr. Rajesh Kumar',
      cosupervisor: 'Dr. Priya Mehta',
      department: 'Computer Science',
      admissionYear: '2021',
      stage: 'research',
      dcStatus: 'approved',
      creditsCompleted: 24,
      creditsRequired: 24,
    },
    {
      id: '2',
      studentId: 'PHD2022EE005',
      name: 'Neha Verma',
      supervisor: 'Dr. Amit Singh',
      department: 'Electrical Engineering',
      admissionYear: '2022',
      stage: 'comprehensive',
      dcStatus: 'approved',
      creditsCompleted: 20,
      creditsRequired: 24,
    },
    {
      id: '3',
      studentId: 'PHD2023CS012',
      name: 'Rahul Gupta',
      supervisor: 'Dr. Nitin Auluck',
      department: 'Computer Science',
      admissionYear: '2023',
      stage: 'coursework',
      dcStatus: 'pending',
      creditsCompleted: 12,
      creditsRequired: 24,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [dcStatusFilter, setDcStatusFilter] = useState('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || student.stage === stageFilter;
    const matchesDcStatus = dcStatusFilter === 'all' || student.dcStatus === dcStatusFilter;
    return matchesSearch && matchesStage && matchesDcStatus;
  });

  const handleApproveDC = (studentId: string) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, dcStatus: 'approved' as const } : s)));
  };

  const handleRejectDC = (studentId: string) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, dcStatus: 'rejected' as const } : s)));
  };

  const getStageBadge = (stage: PhDStudent['stage']) => {
    const styles = {
      coursework: 'bg-blue-100 text-blue-800',
      comprehensive: 'bg-purple-100 text-purple-800',
      research: 'bg-indigo-100 text-indigo-800',
      thesis: 'bg-orange-100 text-orange-800',
      defense: 'bg-green-100 text-green-800',
    };
    const labels = {
      coursework: 'Coursework',
      comprehensive: 'Comprehensive',
      research: 'Research',
      thesis: 'Thesis Writing',
      defense: 'Defense',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[stage]}`}>
        {labels[stage]}
      </span>
    );
  };

  const getDcStatusBadge = (status: PhDStudent['dcStatus']) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'DC Pending',
      approved: 'DC Approved',
      rejected: 'DC Rejected',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const stats = {
    total: students.length,
    coursework: students.filter((s) => s.stage === 'coursework').length,
    research: students.filter((s) => s.stage === 'research').length,
    pendingDC: students.filter((s) => s.dcStatus === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              PhD Program
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              PhD Student Management
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Manage PhD students, doctoral committees, and progress tracking
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add PhD Student
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total PhD Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.coursework}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">In Coursework</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.research}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">In Research</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.pendingDC}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Pending DC Approval</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">PhD Students</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Stages</option>
              <option value="coursework">Coursework</option>
              <option value="comprehensive">Comprehensive</option>
              <option value="research">Research</option>
              <option value="thesis">Thesis Writing</option>
              <option value="defense">Defense</option>
            </select>

            <select
              value={dcStatusFilter}
              onChange={(e) => setDcStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All DC Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Students List */}
        <div className="mt-6 space-y-3">
          {filteredStudents.map((student) => {
            const progressPercent = (student.creditsCompleted / student.creditsRequired) * 100;
            return (
              <div
                key={student.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <GraduationCap className="h-7 w-7 text-indigo-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                        {getStageBadge(student.stage)}
                        {getDcStatusBadge(student.dcStatus)}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        <span className="font-medium">{student.studentId}</span>
                        <span>{student.department}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Admitted: {student.admissionYear}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-x-4 text-xs text-slate-600">
                        <span>
                          <strong>Supervisor:</strong> {student.supervisor}
                        </span>
                        {student.cosupervisor && (
                          <span>
                            <strong>Co-supervisor:</strong> {student.cosupervisor}
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">Credit Progress</span>
                          <span className="font-semibold text-indigo-600">
                            {student.creditsCompleted}/{student.creditsRequired} ({progressPercent.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {student.dcStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveDC(student.id)}
                          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve DC
                        </button>
                        <button
                          onClick={() => handleRejectDC(student.id)}
                          className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Reject DC
                        </button>
                      </>
                    )}
                    <button className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No PhD students found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
