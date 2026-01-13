'use client';

import { Mail, Phone, MapPin, Award, BookOpen, Users, Calendar } from 'lucide-react';

export default function InstructorProfilePage() {
  const instructor = {
    name: 'Dr. Vikram Mehta',
    designation: 'Associate Professor',
    department: 'Computer Science and Engineering',
    email: 'vikram.mehta@iitrpr.ac.in',
    phone: '+91 98765 43210',
    office: 'Main Building, Room 304',
    specialization: ['Distributed Systems', 'Cloud Computing', 'Parallel Algorithms'],
    education: [
      { degree: 'PhD in Computer Science', institution: 'IIT Delhi', year: '2012' },
      { degree: 'M.Tech in Computer Science', institution: 'IIT Bombay', year: '2008' },
      { degree: 'B.Tech in Computer Science', institution: 'NIT Trichy', year: '2006' },
    ],
    experience: '12+ years in academia',
    researchInterests: [
      'Distributed Computing',
      'Cloud Infrastructure',
      'High Performance Computing',
      'Blockchain Technology',
    ],
  };

  const coursesTaught = [
    { code: 'CS502', title: 'Data Structures and Algorithms', session: '2025-II' },
    { code: 'CS604', title: 'Advanced Operating Systems', session: '2025-II' },
    { code: 'CS701', title: 'Distributed Systems', session: '2025-II' },
    { code: 'CS450', title: 'Computer Networks', session: '2024-II' },
    { code: 'CS601', title: 'Advanced Algorithms', session: '2024-I' },
  ];

  const publications = [
    {
      title: 'Efficient Resource Allocation in Cloud Computing Environments',
      venue: 'IEEE Transactions on Cloud Computing, 2025',
    },
    {
      title: 'Scalable Distributed Consensus Algorithms for Blockchain',
      venue: 'ACM SIGMOD Conference, 2024',
    },
    {
      title: 'Performance Analysis of Parallel Sorting Algorithms',
      venue: 'Journal of Parallel and Distributed Computing, 2023',
    },
  ];

  const stats = {
    coursesThisSemester: 3,
    totalStudents: 105,
    yearsOfExperience: 12,
    publications: publications.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-3xl font-bold text-white">
            {instructor.name.split(' ').map((n) => n[0]).join('')}
          </div>

          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Faculty Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {instructor.name}
            </h1>
            <p className="mt-1 text-lg font-medium text-slate-700">
              {instructor.designation}
            </p>
            <p className="mt-1 text-sm text-slate-600">{instructor.department}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                {instructor.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                {instructor.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {instructor.office}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {stats.coursesThisSemester}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Courses This Semester
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.yearsOfExperience}+
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">Years Experience</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.publications}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Publications</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Education */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Education</h2>
          </div>
          <div className="mt-4 space-y-3">
            {instructor.education.map((edu, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                <p className="mt-1 text-sm text-slate-700">{edu.institution}</p>
                <p className="mt-1 text-xs text-slate-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Specialization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Areas of Specialization</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {instructor.specialization.map((area, idx) => (
              <span
                key={idx}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700"
              >
                {area}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900">Research Interests</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {instructor.researchInterests.map((interest, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Courses Taught */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Courses Taught</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {coursesTaught.map((course, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900">{course.code}</p>
                <p className="mt-0.5 text-sm text-slate-600">{course.title}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {course.session}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Publications */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Recent Publications</h2>
        </div>
        <div className="mt-4 space-y-3">
          {publications.map((pub, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">{pub.title}</p>
              <p className="mt-1 text-xs text-slate-600">{pub.venue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      <div className="flex justify-end">
        <button className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
