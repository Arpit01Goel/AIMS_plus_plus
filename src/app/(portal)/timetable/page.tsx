'use client';

import { useState, useEffect } from 'react';

// Data structure for course schedule - can be easily integrated with backend
interface CourseSchedule {
  courseCode: string;
  title: string;
  instructor: string;
  location: string;
  schedule: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    startTime: string; // e.g., "9:00"
    endTime: string; // e.g., "9:50"
    slot: string; // e.g., "PC-1"
  }[];
}

// Time slots configuration matching the timetable image
const TIME_SLOTS = [
  { start: '8:00', end: '8:50', label: '8:00 - 8:50' },
  { start: '9:00', end: '9:50', label: '9:00 - 9:50' },
  { start: '10:00', end: '10:50', label: '10:00 - 10:50' },
  { start: '11:00', end: '11:50', label: '11:00 - 11:50' },
  { start: '12:00', end: '12:50', label: '12:00 - 12:50' },
  { start: '13:00', end: '13:50', label: 'Lunch Break', isBreak: true },
  { start: '14:00', end: '14:50', label: '2:00 - 2:50' },
  { start: '15:00', end: '15:50', label: '3:00 - 3:50' },
  { start: '16:00', end: '16:50', label: '4:00 - 4:50' },
  { start: '17:00', end: '17:50', label: '5:00 - 5:50' },
  { start: '18:00', end: '18:50', label: '6:00 - 6:50' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

// TODO: Replace with API call to fetch enrolled courses with schedules
const fetchStudentTimetable = async (): Promise<CourseSchedule[]> => {
  return Promise.resolve([
    {
      courseCode: 'CS502',
      title: 'Data Structures and Algorithms',
      instructor: 'Dr. Rajesh Kumar',
      location: 'A-101',
      schedule: [
        { day: 'Monday', startTime: '9:00', endTime: '9:50', slot: 'PC-1' },
        { day: 'Wednesday', startTime: '9:00', endTime: '9:50', slot: 'PC-1' },
        { day: 'Friday', startTime: '9:00', endTime: '9:50', slot: 'PC-1' },
      ],
    },
    {
      courseCode: 'MA301',
      title: 'Linear Algebra',
      instructor: 'Dr. Anita Verma',
      location: 'B-204',
      schedule: [
        { day: 'Monday', startTime: '10:00', endTime: '10:50', slot: 'MA102' },
        { day: 'Thursday', startTime: '10:00', endTime: '10:50', slot: 'MA102' },
      ],
    },
    {
      courseCode: 'CS701',
      title: 'Distributed Systems',
      instructor: 'Dr. Vikram Mehta',
      location: 'C-301',
      schedule: [
        { day: 'Tuesday', startTime: '11:00', endTime: '11:50', slot: 'PC-3' },
        { day: 'Thursday', startTime: '14:00', endTime: '14:50', slot: 'PC-3' },
      ],
    },
    {
      courseCode: 'EE401',
      title: 'Digital Signal Processing',
      instructor: 'Dr. Sunita Rani',
      location: 'D-102',
      schedule: [
        { day: 'Monday', startTime: '15:00', endTime: '15:50', slot: 'PCPE' },
        { day: 'Wednesday', startTime: '15:00', endTime: '15:50', slot: 'PCPE' },
      ],
    },
    {
      courseCode: 'CS604',
      title: 'Advanced Operating Systems',
      instructor: 'Nitin Auluck',
      location: 'A-205',
      schedule: [
        { day: 'Tuesday', startTime: '14:00', endTime: '14:50', slot: 'HSME' },
        { day: 'Friday', startTime: '14:00', endTime: '14:50', slot: 'HSME' },
      ],
    },
  ]);
};

export default function TimetablePage() {
  const [courses, setCourses] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const data = await fetchStudentTimetable();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch timetable:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTimetable();
  }, []);

  // Helper function to find course at specific day and time
  const getCourseAtSlot = (day: string, startTime: string) => {
    for (const course of courses) {
      const slot = course.schedule.find(
        (s) => s.day === day && s.startTime === startTime
      );
      if (slot) {
        return { course, slot };
      }
    }
    return null;
  };

  const CourseCell = ({
    course,
    slot,
  }: {
    course: CourseSchedule;
    slot: CourseSchedule['schedule'][0];
  }) => (
    <div
      className="group relative cursor-default rounded-lg bg-indigo-700 p-2 shadow-sm transition-all hover:shadow-md text-center"
    >
      <div className="text-xs font-bold text-white">{course.courseCode}</div>
      <div className="mt-0.5 text-xs font-medium text-white/90">{slot.slot}</div>
      <div className="mt-0.5 text-xs text-white/80">{course.location}</div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg group-hover:block">
        <div className="text-sm font-bold text-slate-900">{course.courseCode}</div>
        <div className="mt-1 text-xs text-slate-700">{course.title}</div>
        <div className="mt-2 text-xs text-slate-600">
          <div>Instructor: {course.instructor}</div>
          <div className="mt-1">Location: {course.location}</div>
          <div className="mt-1">Slot: {slot.slot}</div>
        </div>
      </div>
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

  const totalCredits = courses.reduce((sum, course) => {
    // Assuming 3 lectures per week = 3 credits (can be adjusted)
    return sum + course.schedule.length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Timetable</h1>
            <p className="mt-2 text-indigo-100">
              2nd Semester of the A.Y. 2025-26 (January 2026-May 2026)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Enrolled Courses</div>
              <div className="text-2xl font-bold text-white">{courses.length}</div>
            </div>
            <div className="rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-sm text-indigo-100">Weekly Classes</div>
              <div className="text-2xl font-bold text-white">{totalCredits}</div>
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
            {TIME_SLOTS.map((timeSlot, index) => (
              <tr
                key={`${timeSlot.start}-${timeSlot.end}`}
                className={`border-b border-slate-100 ${
                  timeSlot.isBreak ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                }`}
              >
                <td className="sticky left-0 z-10 border-r border-slate-200 bg-white p-3 text-xs font-medium text-slate-600">
                  {timeSlot.label}
                </td>
                {timeSlot.isBreak ? (
                  <td
                    colSpan={5}
                    className="p-3 text-center text-sm font-medium text-slate-500"
                  >
                    Lunch Break
                  </td>
                ) : (
                  DAYS.map((day) => {
                    const courseAtSlot = getCourseAtSlot(day, timeSlot.start);
                    return (
                      <td key={day} className="p-2">
                        {courseAtSlot ? (
                          <CourseCell
                            course={courseAtSlot.course}
                            slot={courseAtSlot.slot}
                          />
                        ) : (
                          <div className="h-16 rounded-lg border border-dashed border-slate-200"></div>
                        )}
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
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
          <p className="mt-2 text-sm font-medium text-slate-900">No courses scheduled</p>
          <p className="mt-1 text-sm text-slate-500">
            Enroll in courses to see your timetable
          </p>
        </div>
      )}
    </div>
  );
}
