'use client';

import { useState } from 'react';
import { Search, UserCog, Plus, Edit, Trash, Users } from 'lucide-react';

interface Advisor {
  id: string;
  advisorId: string;
  name: string;
  department: string;
  email: string;
  assignedBatches: string[];
  totalStudents: number;
}

export default function BatchAdvisorsPage() {
  const [advisors, setAdvisors] = useState<Advisor[]>([
    {
      id: '1',
      advisorId: 'FAC001',
      name: 'Dr. Rajesh Kumar',
      department: 'Computer Science',
      email: 'rajesh@example.edu',
      assignedBatches: ['2021-M.Tech-CS', '2022-M.Tech-CS'],
      totalStudents: 45,
    },
    {
      id: '2',
      advisorId: 'FAC012',
      name: 'Dr. Priya Sharma',
      department: 'Electrical Engineering',
      email: 'priya@example.edu',
      assignedBatches: ['2021-M.Tech-EE'],
      totalStudents: 30,
    },
    {
      id: '3',
      advisorId: 'FAC025',
      name: 'Dr. Amit Singh',
      department: 'Computer Science',
      email: 'amit@example.edu',
      assignedBatches: ['2023-M.Tech-CS', '2023-PhD-CS'],
      totalStudents: 38,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch =
      advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.advisorId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || advisor.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleDelete = (advisorId: string) => {
    if (confirm('Are you sure you want to remove this advisor assignment?')) {
      setAdvisors(advisors.filter((a) => a.id !== advisorId));
    }
  };

  const stats = {
    total: advisors.length,
    totalStudents: advisors.reduce((sum, a) => sum + a.totalStudents, 0),
    avgStudentsPerAdvisor: Math.round(
      advisors.reduce((sum, a) => sum + a.totalStudents, 0) / advisors.length
    ),
    totalBatches: advisors.reduce((sum, a) => sum + a.assignedBatches.length, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Batch Advisors
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Advisor Assignments
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Assign faculty members as batch advisors to mentor student groups
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Assign Advisor
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Active Advisors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalBatches}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Assigned Batches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.avgStudentsPerAdvisor}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Avg per Advisor</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Advisor List</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by advisor name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Advisors List */}
        <div className="mt-6 space-y-3">
          {filteredAdvisors.map((advisor) => (
            <div
              key={advisor.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                    <UserCog className="h-7 w-7 text-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{advisor.name}</h3>
                      <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">
                        {advisor.advisorId}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span>{advisor.department}</span>
                      <span>{advisor.email}</span>
                      <span className="flex items-center gap-1 font-semibold text-indigo-600">
                        <Users className="h-3.5 w-3.5" />
                        {advisor.totalStudents} students
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-700">Assigned Batches:</p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {advisor.assignedBatches.map((batch, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
                          >
                            {batch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(advisor.id)}
                    className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAdvisors.length === 0 && (
          <div className="py-12 text-center">
            <UserCog className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No advisors found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
