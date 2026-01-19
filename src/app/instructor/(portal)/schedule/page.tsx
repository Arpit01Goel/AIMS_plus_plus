'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Calendar as CalendarIcon } from 'lucide-react';

interface ClassSchedule {
  id: string;
  day: string;
  time: string;
  course: {
    code: string;
    title: string;
  };
  location: string;
  section: string;
  type: 'lecture' | 'tutorial' | 'lab';
}

export default function SchedulePage() {
  const [selectedWeek, setSelectedWeek] = useState<'current' | 'next'>('current');
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      if (res.ok) {
        setSchedule(data.schedule || []);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const oldSchedule: ClassSchedule[] = [
    {
      id: '1',
      day: 'Monday',
      time: '09:00 - 10:30',
      course: { code: 'CS502', title: 'Data Structures and Algorithms' },
      location: 'LHC-101',
      section: 'A',
      type: 'lecture',
    },
    {
      id: '2',
      day: 'Monday',
      time: '14:00 - 15:30',
      course: { code: 'CS604', title: 'Advanced Operating Systems' },
      location: 'LHC-205',
      section: 'B',
      type: 'lecture',
    },
    {
      id: '3',
      day: 'Tuesday',
      time: '10:00 - 11:30',
      course: { code: 'CS701', title: 'Distributed Systems' },
      location: 'Online - Teams',
      section: 'A',
      type: 'lecture',
    },
    {
      id: '4',
      day: 'Wednesday',
      time: '09:00 - 10:30',
      course: { code: 'CS502', title: 'Data Structures and Algorithms' },
      location: 'LHC-101',
      section: 'A',
      type: 'tutorial',
    },
    {
      id: '5',
      day: 'Wednesday',
      time: '15:00 - 17:00',
      course: { code: 'CS604', title: 'Advanced Operating Systems' },
      location: 'Lab-3',
      section: 'B',
      type: 'lab',
    },
    {
      id: '6',
      day: 'Thursday',
      time: '11:00 - 12:30',
      course: { code: 'CS701', title: 'Distributed Systems' },
      location: 'LHC-302',
      section: 'A',
      type: 'lecture',
    },
    {
      id: '7',
      day: 'Friday',
      time: '09:00 - 10:30',
      course: { code: 'CS502', title: 'Data Structures and Algorithms' },
      location: 'LHC-101',
      section: 'A',
      type: 'lecture',
    },
    {
      id: '8',
      day: 'Friday',
      time: '14:00 - 15:30',
      course: { code: 'CS604', title: 'Advanced Operating Systems' },
      location: 'LHC-205',
      section: 'B',
      type: 'lecture',
    },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getScheduleByDay = (day: string) => {
    return schedule.filter((item) => item.day === day).sort((a, b) => {
      const timeA = a.time.split('-')[0].trim();
      const timeB = b.time.split('-')[0].trim();
      return timeA.localeCompare(timeB);
    });
  };

  const getTypeColor = (type: ClassSchedule['type']) => {
    const colors = {
      lecture: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      tutorial: 'bg-green-100 text-green-800 border-green-200',
      lab: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type];
  };

  const totalClasses = schedule.length;
  const hoursPerWeek = schedule.reduce((sum, item) => {
    if (!item.time || typeof item.time !== 'string' || !item.time.includes('-')) {
      return sum;
    }
    const [start, end] = item.time.split('-').map((t) => {
      const [h, m] = t.trim().split(':');
      return parseInt(h) * 60 + parseInt(m);
    });
    return sum + (end - start) / 60;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Teaching Schedule
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              My Weekly Schedule
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              View your teaching schedule and plan your week
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedWeek('current')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedWeek === 'current'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Current Week
            </button>
            <button
              onClick={() => setSelectedWeek('next')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedWeek === 'next'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Next Week
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalClasses}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Classes This Week
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {hoursPerWeek.toFixed(1)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Teaching Hours
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">3</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Active Courses
            </p>
          </div>
        </div>
      </div>

      {/* Day-by-Day Schedule */}
      <div className="space-y-4">
        {days.map((day) => {
          const daySchedule = getScheduleByDay(day);
          if (daySchedule.length === 0) return null;

          return (
            <div
              key={day}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">{day}</h2>
                <span className="ml-2 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {daySchedule.length} {daySchedule.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {daySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50"
                  >
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-100">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      <p className="mt-1 text-xs font-bold text-indigo-900">
                        {item.time.split('-')[0].trim()}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {item.course.code}
                            </h3>
                            <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                              Sec {item.section}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getTypeColor(
                                item.type
                              )}`}
                            >
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {item.course.title}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {item.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {item.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              Section {item.section}
                            </div>
                          </div>
                        </div>

                        <button className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50">
                          Join Class
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Class Types</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-500" />
            <span className="text-sm text-slate-700">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-700">Tutorial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-sm text-slate-700">Lab</span>
          </div>
        </div>
      </div>
    </div>
  );
}
