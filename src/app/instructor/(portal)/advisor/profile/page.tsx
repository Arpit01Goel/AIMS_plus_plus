'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, Building2, Calendar, Users, CheckCircle, Clock, Award, BookOpen, Loader2 } from 'lucide-react';

interface ProfileData {
  profile: {
    name: string;
    email: string;
    department: string;
    departmentCode: string;
    program: string;
    primaryCohort: number | null;
    totalStudents: number;
  };
  activityStats: {
    thisMonth: {
      approvals: number;
      rejections: number;
    };
    lastMonth: {
      approvals: number;
      rejections: number;
    };
  };
}

export default function AdvisorProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/advisor/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfileData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800">Error: {error || 'Failed to load profile'}</p>
        <button
          onClick={fetchProfile}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { profile, activityStats } = profileData;
  const totalApprovals = activityStats.thisMonth.approvals + activityStats.lastMonth.approvals;
  const totalRejections = activityStats.thisMonth.rejections + activityStats.lastMonth.rejections;
  const approvalRate = totalApprovals + totalRejections > 0 
    ? ((totalApprovals / (totalApprovals + totalRejections)) * 100).toFixed(1)
    : '0.0';

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
              <p className="mt-1 text-sm font-medium text-indigo-600">Faculty Advisor</p>
              <p className="mt-1 text-xs text-slate-600">{profile.departmentCode}</p>
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
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Department</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.department}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-700">Program</p>
                  <p className="mt-1 text-sm text-slate-900">{profile.program}</p>
                </div>
              </div>

              {profile.primaryCohort && (
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Primary Cohort</p>
                    <p className="mt-1 text-sm text-slate-900">{profile.primaryCohort}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Overview Statistics</h3>

            <div className="mt-4 space-y-4">
              <div className="text-center rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-indigo-700">{profile.totalStudents}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Total Assigned Students</p>
              </div>

              <div className="text-center rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-green-600">{approvalRate}%</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Approval Rate</p>
              </div>

              <div className="text-center rounded-xl bg-slate-50 p-4">
                <p className="text-3xl font-bold text-blue-600">{profile.primaryCohort || 'N/A'}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">Primary Cohort</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Batch Assignment Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Batch Assignment</h3>
            </div>

            <div className="mt-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {profile.department} - {profile.program}
                    </h4>
                    {profile.primaryCohort && (
                      <p className="mt-1 text-sm text-slate-600">
                        Primary Cohort: {profile.primaryCohort}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Department Code: {profile.departmentCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-indigo-700">{profile.totalStudents}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Approval Activity</h3>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">This Month</h4>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{activityStats.thisMonth.approvals}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Approvals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{activityStats.thisMonth.rejections}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Rejections</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-bold text-slate-900">Last Month</h4>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{activityStats.lastMonth.approvals}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Approvals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{activityStats.lastMonth.rejections}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Rejections</p>
                  </div>
                </div>
              </div>
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
