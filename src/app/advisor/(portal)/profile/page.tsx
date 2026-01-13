'use client';

import { useState } from 'react';
import { Mail, Phone, Building2, Calendar, Users, CheckCircle, Clock, Award, BookOpen } from 'lucide-react';

interface BatchAssignment {
  id: string;
  department: string;
  degree: string;
  yearOfEntry: number;
  totalStudents: number;
  assignedDate: string;
}

interface ActivityStat {
  period: string;
  approvals: number;
  rejections: number;
  reviews: number;
}

export default function AdvisorProfilePage() {
  const [profile] = useState({
    name: 'Dr. Rajesh Kumar',
    employeeId: 'FAC001',
    email: 'rajesh.kumar@iitrpr.ac.in',
    phone: '+91 98765 43210',
    department: 'Computer Science',
    designation: 'Associate Professor',
    joiningDate: '2018-07-15',
    officeRoom: 'Academic Block A-305',
    officeHours: 'Monday & Thursday, 2:00 PM - 4:00 PM',
  });

  const [batchAssignments] = useState<BatchAssignment[]>([
    {
      id: '1',
      department: 'Computer Science',
      degree: 'M.Tech',
      yearOfEntry: 2021,
      totalStudents: 45,
      assignedDate: '2021-08-01',
    },
    {
      id: '2',
      department: 'Computer Science',
      degree: 'M.Tech',
      yearOfEntry: 2022,
      totalStudents: 38,
      assignedDate: '2022-08-01',
    },
  ]);

  const [activityStats] = useState<ActivityStat[]>([
    { period: 'This Month', approvals: 24, rejections: 3, reviews: 8 },
    { period: 'Last Month', approvals: 32, rejections: 5, reviews: 12 },
    { period: 'This Semester', approvals: 78, rejections: 12, reviews: 28 },
    { period: 'Last Semester', approvals: 85, rejections: 10, reviews: 25 },
  ]);

  const totalStudents = batchAssignments.reduce((sum, batch) => sum + batch.totalStudents, 0);
  const totalApprovals = activityStats[2].approvals;
  const totalRejections = activityStats[2].rejections;
  const approvalRate = ((totalApprovals / (totalApprovals + totalRejections)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Faculty Information
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Advisor Profile
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            View your profile details and batch advisor assignments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Basic Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-b from-indigo-600 to-indigo-700 text-3xl font-bold text-white shadow-lg">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">{profile.name}</h2>
              <p className="mt-1 text-sm font-medium text-indigo-600">{profile.designation}</p>
              <p className="mt-1 text-xs text-slate-600">{profile.employeeId}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Email</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Phone</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Department</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Office Room</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.officeRoom}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Office Hours</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.officeHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Joining Date</p>
                  <p className="mt-1 text-sm text-slate-900">
                    {new Date(profile.joiningDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Overview Statistics</h3>

            <div className="mt-4 space-y-4">
              <div className="text-center rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-indigo-700">{totalStudents}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Total Assigned Students</p>
              </div>

              <div className="text-center rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Approval Rate</p>
              </div>

              <div className="text-center rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-blue-600">{batchAssignments.length}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Batch Assignments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Batch Assignments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Batch Assignments</h3>
            </div>

            <div className="mt-4 space-y-3">
              {batchAssignments.map((batch) => (
                <div
                  key={batch.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {batch.department} - {batch.degree}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600">
                        Year of Entry: {batch.yearOfEntry}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Assigned since: {new Date(batch.assignedDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-700">{batch.totalStudents}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">Students</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
                      View Students
                    </button>
                    <button className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                      Generate Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Statistics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Approval Activity</h3>
            </div>

            <div className="mt-4 space-y-3">
              {activityStats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h4 className="font-bold text-slate-900">{stat.period}</h4>
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stat.approvals}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">Approvals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stat.rejections}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">Rejections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stat.reviews}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">Reviews</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Advisor Responsibilities</h3>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">Enrollment Approvals</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Review and approve/reject course enrollment requests from batch students
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">Academic Monitoring</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Monitor academic performance and progress of assigned students
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">Credit Violation Management</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Track and resolve credit limit violations and category deficits
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">Student Counseling</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Provide academic guidance and counseling to students during office hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-slate-900">Report Generation</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Generate semester reports and academic performance summaries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
