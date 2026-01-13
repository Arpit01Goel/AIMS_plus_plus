'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, Mail, Shield, Bell, Calendar } from 'lucide-react';

export default function SystemConfigPage() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'AIMS++',
    instituteName: 'Indian Institute of Technology',
    academicYear: '2025-2026',
    currentSession: '2025-II',
    
    // Registration Settings
    maxCreditsPerSemester: 24,
    minCreditsPerSemester: 12,
    allowOverload: true,
    overloadMaxCredits: 28,
    registrationBuffer: 7,
    
    // Grade Settings
    passingGrade: 'C',
    gradeFreezeDays: 14,
    allowGradeRevision: true,
    
    // Attendance Settings
    minimumAttendance: 75,
    attendanceGracePeriod: 5,
    
    // Email Settings
    smtpServer: 'smtp.example.edu',
    smtpPort: 587,
    senderEmail: 'noreply@example.edu',
    senderName: 'AIMS++ System',
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    notifyEnrollmentUpdates: true,
    notifyGradeUpdates: true,
    notifyAttendanceAlerts: true,
  });

  const handleSave = () => {
    alert('System configuration saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      alert('Settings reset to defaults.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              System Configuration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              System Settings
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Configure system-wide parameters and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <Database className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">System Information</h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">System Name</label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Institute Name
            </label>
            <input
              type="text"
              value={settings.instituteName}
              onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Academic Year
            </label>
            <input
              type="text"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Current Session
            </label>
            <select
              value={settings.currentSession}
              onChange={(e) => setSettings({ ...settings, currentSession: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="2025-I">2025-I (Spring)</option>
              <option value="2025-II">2025-II (Fall)</option>
              <option value="2026-I">2026-I (Spring)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registration Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Registration Settings</h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Max Credits per Semester
            </label>
            <input
              type="number"
              value={settings.maxCreditsPerSemester}
              onChange={(e) =>
                setSettings({ ...settings, maxCreditsPerSemester: parseInt(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Min Credits per Semester
            </label>
            <input
              type="number"
              value={settings.minCreditsPerSemester}
              onChange={(e) =>
                setSettings({ ...settings, minCreditsPerSemester: parseInt(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={settings.allowOverload}
                onChange={(e) => setSettings({ ...settings, allowOverload: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              Allow Credit Overload
            </label>
            {settings.allowOverload && (
              <input
                type="number"
                value={settings.overloadMaxCredits}
                onChange={(e) =>
                  setSettings({ ...settings, overloadMaxCredits: parseInt(e.target.value) })
                }
                placeholder="Max overload credits"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Registration Buffer (days)
            </label>
            <input
              type="number"
              value={settings.registrationBuffer}
              onChange={(e) =>
                setSettings({ ...settings, registrationBuffer: parseInt(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">Days before semester to allow registration</p>
          </div>
        </div>
      </div>

      {/* Grade Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Grade & Attendance Settings</h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Passing Grade
            </label>
            <select
              value={settings.passingGrade}
              onChange={(e) => setSettings({ ...settings, passingGrade: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="D">D</option>
              <option value="C">C</option>
              <option value="B">B</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Grade Freeze Days
            </label>
            <input
              type="number"
              value={settings.gradeFreezeDays}
              onChange={(e) =>
                setSettings({ ...settings, gradeFreezeDays: parseInt(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-slate-500">Days after submission before grade freeze</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Minimum Attendance (%)
            </label>
            <input
              type="number"
              value={settings.minimumAttendance}
              onChange={(e) =>
                setSettings({ ...settings, minimumAttendance: parseInt(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={settings.allowGradeRevision}
                onChange={(e) => setSettings({ ...settings, allowGradeRevision: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
              Allow Grade Revision
            </label>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Email Configuration</h2>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">SMTP Server</label>
            <input
              type="text"
              value={settings.smtpServer}
              onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">SMTP Port</label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Sender Email</label>
            <input
              type="email"
              value={settings.senderEmail}
              onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Sender Name</label>
            <input
              type="text"
              value={settings.senderName}
              onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, enableEmailNotifications: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            Enable Email Notifications
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.enableSMSNotifications}
              onChange={(e) =>
                setSettings({ ...settings, enableSMSNotifications: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            Enable SMS Notifications
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.notifyEnrollmentUpdates}
              onChange={(e) =>
                setSettings({ ...settings, notifyEnrollmentUpdates: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            Notify on Enrollment Updates
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.notifyGradeUpdates}
              onChange={(e) => setSettings({ ...settings, notifyGradeUpdates: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            Notify on Grade Updates
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={settings.notifyAttendanceAlerts}
              onChange={(e) =>
                setSettings({ ...settings, notifyAttendanceAlerts: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
            />
            Notify on Attendance Alerts
          </label>
        </div>
      </div>
    </div>
  );
}
