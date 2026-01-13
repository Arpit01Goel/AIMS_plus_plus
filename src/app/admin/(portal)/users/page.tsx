'use client';

import { useState } from 'react';
import { Search, Filter, Upload, Plus, Edit, Trash2, Lock, Unlock, Key } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  loginId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STU' | 'FAC' | 'HOD' | 'ACA' | 'DEA' | 'ADV';
  orgId: string;
  department: string;
  status: 'active' | 'locked';
  yearOfEntry?: number;
  degree?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      loginId: 'rahul.sharma',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.sharma@iitrpr.ac.in',
      role: 'STU',
      orgId: '2021CSB1111',
      department: 'Computer Science',
      status: 'active',
      yearOfEntry: 2021,
      degree: 'B.Tech',
    },
    {
      id: '2',
      loginId: 'vikram.mehta',
      firstName: 'Vikram',
      lastName: 'Mehta',
      email: 'vikram.mehta@iitrpr.ac.in',
      role: 'FAC',
      orgId: 'FAC001',
      department: 'Computer Science',
      status: 'active',
    },
    // More sample data...
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.orgId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesDept = deptFilter === 'all' || user.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      // Backend integration will handle CSV parsing and user creation
      alert('Bulk upload will be integrated with backend API!');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'login_id,email,first_name,last_name,role,org_id,department,degree,year_of_entry\nstudent1,student1@iitrpr.ac.in,John,Doe,STU,2021CSB1234,Computer Science,B.Tech,2021';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_user_template.csv';
    a.click();
  };

  const getRoleBadge = (role: User['role']) => {
    const styles = {
      STU: 'bg-blue-100 text-blue-800',
      FAC: 'bg-green-100 text-green-800',
      HOD: 'bg-purple-100 text-purple-800',
      ACA: 'bg-indigo-100 text-indigo-800',
      DEA: 'bg-orange-100 text-orange-800',
      ADV: 'bg-indigo-100 text-indigo-800',
    };
    const labels = {
      STU: 'Student',
      FAC: 'Faculty',
      HOD: 'HoD',
      ACA: 'Admin',
      DEA: 'Dean',
      ADV: 'Advisor',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === 'STU').length,
    faculty: users.filter((u) => u.role === 'FAC').length,
    admins: users.filter((u) => ['ACA', 'DEA', 'HOD'].includes(u.role)).length,
    active: users.filter((u) => u.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              User Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage System Users
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Create, edit, and manage user accounts across all roles
            </p>
          </div>
          <Link
            href="/admin/users/create"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-5">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.faculty}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Faculty</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.admins}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Admins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Active</p>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Bulk User Upload</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload CSV file to create multiple users at once
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            <Upload className="h-5 w-5" />
            Download CSV Template
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100">
            <Upload className="h-5 w-5" />
            Upload Users CSV
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">CSV Format Requirements:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
            <li>Headers: login_id, email, first_name, last_name, role, org_id, department</li>
            <li>Role values: STU (Student), FAC (Faculty), HOD, ACA, DEA, ADV</li>
            <li>For students: Include degree and year_of_entry columns</li>
            <li>System will auto-generate passwords and send welcome emails</li>
          </ul>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Search Users</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by login ID, name, email, or org ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Roles</option>
              <option value="STU">Students</option>
              <option value="FAC">Faculty</option>
              <option value="HOD">HoD</option>
              <option value="ACA">Admin</option>
              <option value="DEA">Dean</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Login ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Org ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Department
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {user.loginId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {user.orgId}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Edit User"
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        title={user.status === 'active' ? 'Lock Account' : 'Unlock Account'}
                        className={`rounded-lg p-2 transition ${
                          user.status === 'active'
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        title="Reset Password"
                        className="rounded-lg bg-purple-100 p-2 text-purple-600 transition hover:bg-purple-200"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        title="Delete User"
                        className="rounded-lg bg-indigo-100 p-2 text-indigo-600 transition hover:bg-indigo-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-600">No users found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
