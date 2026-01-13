'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Edit, Trash, Clock } from 'lucide-react';

interface AcademicEvent {
  id: string;
  title: string;
  type: 'academic' | 'registration' | 'exam' | 'holiday' | 'other';
  startDate: string;
  endDate: string;
  description: string;
  session: string;
}

export default function AcademicCalendarPage() {
  const [events, setEvents] = useState<AcademicEvent[]>([
    {
      id: '1',
      title: 'Semester Start',
      type: 'academic',
      startDate: '2026-01-06',
      endDate: '2026-01-06',
      description: 'First day of 2026-I semester',
      session: '2026-I',
    },
    {
      id: '2',
      title: 'Course Registration',
      type: 'registration',
      startDate: '2026-01-06',
      endDate: '2026-01-15',
      description: 'Open registration period for all students',
      session: '2026-I',
    },
    {
      id: '3',
      title: 'Add/Drop Period',
      type: 'registration',
      startDate: '2026-01-16',
      endDate: '2026-01-25',
      description: 'Add or drop courses without penalty',
      session: '2026-I',
    },
    {
      id: '4',
      title: 'Mid-Semester Exams',
      type: 'exam',
      startDate: '2026-03-01',
      endDate: '2026-03-07',
      description: 'Mid-term examination period',
      session: '2026-I',
    },
    {
      id: '5',
      title: 'Spring Break',
      type: 'holiday',
      startDate: '2026-03-15',
      endDate: '2026-03-22',
      description: 'One week spring break for all students',
      session: '2026-I',
    },
  ]);

  const [sessionFilter, setSessionFilter] = useState('2026-I');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredEvents = events
    .filter((event) => {
      const matchesSession = event.session === sessionFilter;
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      return matchesSession && matchesType;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const handleDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((e) => e.id !== eventId));
    }
  };

  const getTypeBadge = (type: AcademicEvent['type']) => {
    const styles = {
      academic: 'bg-blue-100 text-blue-800',
      registration: 'bg-purple-100 text-purple-800',
      exam: 'bg-red-100 text-red-800',
      holiday: 'bg-green-100 text-green-800',
      other: 'bg-slate-100 text-slate-800',
    };
    const labels = {
      academic: 'Academic',
      registration: 'Registration',
      exam: 'Exam',
      holiday: 'Holiday',
      other: 'Other',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (start === end) return startDate;
    const endDate = new Date(end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Academic Calendar
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Calendar Configuration
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Configure important academic dates, registration periods, and holidays
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Session</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="2026-I">2026-I (Spring)</option>
              <option value="2025-II">2025-II (Fall)</option>
              <option value="2025-I">2025-I</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Event Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="registration">Registration</option>
              <option value="exam">Exams</option>
              <option value="holiday">Holidays</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Academic Events</h2>

        <div className="mt-6 space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
                      {getTypeBadge(event.type)}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {formatDateRange(event.startDate, event.endDate)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">{event.description}</p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="py-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">No events found for selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
