'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, CheckCircle, Loader2, Save, X } from 'lucide-react';

interface AcademicSession {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  offeringsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (session?: AcademicSession) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        code: session.code,
        startDate: session.startDate.split('T')[0],
        endDate: session.endDate.split('T')[0],
        isCurrent: session.isCurrent,
      });
    } else {
      setEditingSession(null);
      setFormData({
        code: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({
      code: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingSession 
        ? '/api/admin/sessions'
        : '/api/admin/sessions';
      
      const method = editingSession ? 'PUT' : 'POST';
      const body = editingSession 
        ? { sessionId: editingSession.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || `Failed to ${editingSession ? 'update' : 'create'} session`);
        return;
      }

      alert(`Session ${editingSession ? 'updated' : 'created'} successfully!`);
      handleCloseForm();
      fetchSessions();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingSession ? 'update' : 'create'} session`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this academic session? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(sessionId);
      const response = await fetch(`/api/admin/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete session');
        return;
      }

      alert('Session deleted successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetCurrent = async (sessionId: string) => {
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          isCurrent: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to set current session');
        return;
      }

      alert('Current session updated successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error setting current session:', error);
      alert('Failed to set current session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: sessions.length,
    current: sessions.filter(s => s.isCurrent).length,
    withOfferings: sessions.filter(s => s.offeringsCount > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Academic Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Academic Sessions
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Manage academic years and semesters for course offerings
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Session
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.current}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Current</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.withOfferings}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">With Offerings</p>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">All Sessions</h2>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">No academic sessions found. Create one to get started.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`rounded-xl border p-4 transition ${
                  session.isCurrent
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                      session.isCurrent ? 'bg-green-100' : 'bg-indigo-100'
                    }`}>
                      <Calendar className={`h-7 w-7 ${session.isCurrent ? 'text-green-600' : 'text-indigo-600'}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{session.code}</h3>
                        {session.isCurrent && (
                          <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        <span className="font-medium">
                          {formatDate(session.startDate)} - {formatDate(session.endDate)}
                        </span>
                        <span>{session.offeringsCount} Offering{session.offeringsCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleSetCurrent(session.id)}
                        className="flex items-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Set Current
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenForm(session)}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      disabled={deleting === session.id}
                      className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingSession ? 'Edit Session' : 'Create New Session'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Session Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., 2025-I, 2025-II"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
                <label htmlFor="isCurrent" className="text-sm font-medium text-slate-900">
                  Set as current session
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {editingSession ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingSession ? 'Update Session' : 'Create Session'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
