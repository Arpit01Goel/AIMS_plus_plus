'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Eye, Edit, Trash, BarChart, Calendar } from 'lucide-react';

interface FeedbackForm {
  id: string;
  title: string;
  type: 'course' | 'instructor' | 'facility' | 'system';
  status: 'draft' | 'active' | 'closed';
  session: string;
  createdDate: string;
  responses: number;
  targetAudience: string;
}

export default function FeedbackSystemPage() {
  const [forms, setForms] = useState<FeedbackForm[]>([
    {
      id: '1',
      title: 'End-Semester Course Feedback',
      type: 'course',
      status: 'active',
      session: '2025-II',
      createdDate: '2025-12-01',
      responses: 342,
      targetAudience: 'All Students',
    },
    {
      id: '2',
      title: 'Instructor Teaching Evaluation',
      type: 'instructor',
      status: 'active',
      session: '2025-II',
      createdDate: '2025-12-01',
      responses: 289,
      targetAudience: 'All Students',
    },
    {
      id: '3',
      title: 'Library Facility Feedback',
      type: 'facility',
      status: 'closed',
      session: '2025-I',
      createdDate: '2025-06-15',
      responses: 156,
      targetAudience: 'All Students',
    },
    {
      id: '4',
      title: 'AIMS Portal Usability Survey',
      type: 'system',
      status: 'draft',
      session: '2026-I',
      createdDate: '2026-01-05',
      responses: 0,
      targetAudience: 'All Users',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredForms = forms.filter((form) => {
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    const matchesType = typeFilter === 'all' || form.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleDelete = (formId: string) => {
    if (confirm('Are you sure you want to delete this feedback form?')) {
      setForms(forms.filter((f) => f.id !== formId));
    }
  };

  const getStatusBadge = (status: FeedbackForm['status']) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-800',
      active: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
    };
    const labels = {
      draft: 'Draft',
      active: 'Active',
      closed: 'Closed',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeBadge = (type: FeedbackForm['type']) => {
    const styles = {
      course: 'bg-blue-100 text-blue-800',
      instructor: 'bg-purple-100 text-purple-800',
      facility: 'bg-orange-100 text-orange-800',
      system: 'bg-indigo-100 text-indigo-800',
    };
    const labels = {
      course: 'Course',
      instructor: 'Instructor',
      facility: 'Facility',
      system: 'System',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const stats = {
    total: forms.length,
    active: forms.filter((f) => f.status === 'active').length,
    draft: forms.filter((f) => f.status === 'draft').length,
    totalResponses: forms.reduce((sum, f) => sum + f.responses, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Feedback System
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Feedback Forms
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Create and manage course, instructor, and facility feedback forms
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Create Form
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Forms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Active Forms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-600">{stats.draft}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Drafts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalResponses}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Responses</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types</option>
              <option value="course">Course</option>
              <option value="instructor">Instructor</option>
              <option value="facility">Facility</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Feedback Forms</h2>

        <div className="mt-6 space-y-3">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{form.title}</h3>
                      {getStatusBadge(form.status)}
                      {getTypeBadge(form.type)}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Session: {form.session}
                      </span>
                      <span>Target: {form.targetAudience}</span>
                      <span>Created: {form.createdDate}</span>
                      <span className="font-semibold text-indigo-600">
                        {form.responses} responses
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                    <BarChart className="h-4 w-4" />
                    View Results
                  </button>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No feedback forms found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
