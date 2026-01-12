'use client';

import { useState } from 'react';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  ltpsc: string;
  credits: number;
  status: 'enrolling' | 'ongoing' | 'completed';
  session: string;
  enrolments: number;
  department: string;
  slot: string;
  instructors: string[];
  isEnrolled: boolean;
}

export default function CoursesPage() {
  const [courses] = useState<Course[]>([
    {
      id: '1',
      courseCode: 'CS604',
      title: 'ADVANCED OPERATING SYSTEMS',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 12,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'Buffer slot',
      instructors: ['Nitin Auluck'],
      isEnrolled: false,
    },
    {
      id: '2',
      courseCode: 'CS502',
      title: 'DATA STRUCTURES AND ALGORITHMS',
      ltpsc: '3-1-0-6-4',
      credits: 4,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 45,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'A1',
      instructors: ['Dr. Rajesh Kumar', 'Dr. Priya Sharma'],
      isEnrolled: true,
    },
    {
      id: '3',
      courseCode: 'MA301',
      title: 'LINEAR ALGEBRA',
      ltpsc: '3-1-0-6-4',
      credits: 4,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 38,
      department: 'Dept. of Mathematics',
      slot: 'B2',
      instructors: ['Dr. Anita Verma'],
      isEnrolled: true,
    },
    {
      id: '4',
      courseCode: 'CS605',
      title: 'MACHINE LEARNING',
      ltpsc: '3-0-0-6-3',
      credits: 3,
      status: 'enrolling',
      session: '2025-II',
      enrolments: 67,
      department: 'Dept. of Computer Science and Engineering',
      slot: 'C1',
      instructors: ['Dr. Amit Singh'],
      isEnrolled: false,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');

  return <div>Test</div>;
}
