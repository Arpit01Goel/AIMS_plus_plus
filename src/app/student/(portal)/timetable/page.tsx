'use client';

import { useState, useEffect } from 'react';

// Data structure for course meeting from API
interface CourseMeeting {
  id: string;
  courseCode: string;
  courseTitle: string;
  dayOfWeek: number; // 1=Monday, 7=Sunday
  startTime: string;
  endTime: string;
  location: string;
  slot: string;
  credits: number;
}

// Time slots configuration matching the timetable image
const TIME_SLOTS = [
  { start: '08:00', end: '09:00', label: '8:00 - 9:00' },
  { start: '09:00', end: '10:00', label: '9:00 - 10:00' },
  { start: '10:00', end: '11:00', label: '10:00 - 11:00' },
  { start: '11:00', end: '12:00', label: '11:00 - 12:00' },
  { start: '12:00', end: '13:00', label: '12:00 - 1:00' },
  { start: '13:00', end: '14:00', label: '1:00 - 2:00' },
  { start: '14:00', end: '15:00', label: '2:00 - 3:00' },
  { start: '15:00', end: '16:00', label: '3:00 - 4:00' },
  { start: '16:00', end: '17:00', label: '4:00 - 5:00' },
  { start: '17:00', end: '18:00', label: '5:00 - 6:00' },
  { start: '18:00', end: '19:00', label: '6:00 - 7:00' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// Map dayOfWeek number to day name
const getDayName = (dayOfWeek: number): string => {
  const dayMap: { [key: number]: string } = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
  };
  return dayMap[dayOfWeek] || 'Unknown';
};

export default function TimetablePage() {
  const [schedule, setSchedule] = useState<CourseMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [totalCourses, setTotalCourses] = useState(0);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses/student/schedule');
        
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        setSchedule(data.schedule);
        setSessionInfo(data.session);
        setTotalCourses(data.totalCourses);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, []);

  // Helper function to find course meeting at specific day and time
  const getMeetingAtSlot = (day: string, startTime: string): CourseMeeting | null => {
    return schedule.find(
      (meeting) => getDayName(meeting.dayOfWeek) === day && meeting.startTime === startTime
    ) || null;
  };

  const CourseCell = ({ meeting }: { meeting: CourseMeeting }) => (
    <div
      className="cursor-default rounded-lg bg-indigo-700 p-2 shadow-sm transition-all hover:shadow-md text-center"
    >
      <div className="text-xs font-bold text-white">{meeting.courseCode}</div>
      <div className="mt-0.5 text-xs font-medium text-white/90">{meeting.slot}</div>
      <div className="mt-0.5 text-xs text-white/80">{meeting.location}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-900"></div>
          <p className="mt-4 text-sm text-slate-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <svg className="h-6 w-6 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Timetable</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const weeklyClasses = schedule.length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Timetable</h1>
            <p className="mt-2 text-indigo-100">
              {sessionInfo?.code || 'Academic Session'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Enrolled Courses</div>
              <div className="text-2xl font-bold text-white">{totalCourses}</div>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Weekly Classes</div>
              <div className="text-2xl font-bold text-white">{weeklyClasses}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-10 w-32 border-r border-slate-200 bg-slate-50 p-3 text-left text-xs font-semibold text-slate-700">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="min-w-[160px] p-3 text-center text-sm font-semibold text-slate-700"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((timeSlot) => (
              <tr
                key={`${timeSlot.start}-${timeSlot.end}`}
                className="border-b border-slate-100 hover:bg-slate-50/50"
              >
                <td className="sticky left-0 z-10 border-r border-slate-200 bg-white p-3 text-xs font-medium text-slate-600">
                  {timeSlot.label}
                </td>
                {DAYS.map((day) => {
                  const meeting = getMeetingAtSlot(day, timeSlot.start);
                  return (
                    <td key={day} className="p-2">
                      {meeting ? (
                        <CourseCell meeting={meeting} />
                      ) : (
                        <div className="h-16 rounded-lg border border-dashed border-slate-200"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {schedule.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm font-medium text-slate-900">No classes scheduled</p>
          <p className="mt-1 text-sm text-slate-500">
            Enroll in courses to see your timetable
          </p>
        </div>
      )}
    </div>
  );
}
