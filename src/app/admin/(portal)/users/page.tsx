'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Upload, Plus, Edit, Trash2, Lock, Unlock, Key, ChevronDown, UserPlus, GraduationCap, Loader2, Download, CheckCircle, XCircle, Info, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  createdAt: string;
  student?: {
    id: string;
    entryNumber: string;
    batch: number | null;
    phone: string | null;
    department: {
      code: string;
      name: string;
    } | null;
    program: {
      code: string;
      name: string;
    } | null;
    advisor: {
      user: {
        name: string;
        email: string;
      };
    } | null;
  };
  instructor?: {
    id: string;
    title: string | null;
    isAdvisor: boolean;
    department: {
      code: string;
      name: string;
    } | null;
  };
  admin?: {
    id: string;
  };
}

interface BulkUploadResult {
  total: number;
  created: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [showUploadResult, setShowUploadResult] = useState(false);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidationPreview, setShowValidationPreview] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<any[]>([]);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.student?.entryNumber && user.student.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'all' ||
      user.role === roleFilter ||
      (roleFilter === 'ADVISOR' && user.instructor?.isAdvisor);

    let matchesDept = true;
    if (deptFilter !== 'all') {
      matchesDept =
        user.student?.department?.code === deptFilter ||
        user.instructor?.department?.code === deptFilter;
    }

    return matchesSearch && matchesRole && matchesDept;
  });

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    try {
      setUploading(true);

      // Parse CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const usersData = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const userData: any = {};

        headers.forEach((header, index) => {
          userData[header] = values[index] || '';
        });

        usersData.push(userData);
      }

      // Send for validation only (not actual upload)
      const response = await fetch('/api/admin/bulk-upload/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: usersData }),
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResult(result);
        setPendingUploadData(usersData);
        setShowValidationPreview(true);
      } else {
        alert(result.error || 'Validation failed');
      }
    } catch (error) {
      console.error('CSV parsing error:', error);
      alert('Failed to process CSV file');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    try {
      setUploading(true);
      setShowValidationPreview(false);

      // Send to backend for actual upload
      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: pendingUploadData }),
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result.results);
        setShowUploadResult(true);
        // Refresh users list
        await fetchUsers();
      } else {
        alert(result.error || 'Bulk upload failed');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Failed to upload users');
    } finally {
      setUploading(false);
      setPendingUploadData([]);
      setValidationResult(null);
    }
  };

  const handleCancelUpload = () => {
    setShowValidationPreview(false);
    setPendingUploadData([]);
    setValidationResult(null);
  };

  const handleDownloadFailedRows = () => {
    if (!validationResult || !validationResult.errors || validationResult.errors.length === 0) return;

    // Create CSV with failed rows
    const headers = 'name,email,password,role,entryNumber,batch,phone,address,department,program,advisor,title,officialEmail,ERROR';
    const failedRows = validationResult.errors.map((err: any) => {
      const rowData = pendingUploadData[err.row - 1];
      return `${rowData.name || ''},${rowData.email || ''},${rowData.password || ''},${rowData.role || ''},${rowData.entryNumber || ''},${rowData.batch || ''},${rowData.phone || ''},${rowData.address || ''},${rowData.department || ''},${rowData.program || ''},${rowData.advisor || ''},${rowData.title || ''},${rowData.officialEmail || ''},"${err.error}"`;
    }).join('\n');

    const csvContent = `${headers}\n${failedRows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'failed_rows.csv';
    a.click();
  };


  const handleDownloadTemplate = () => {
    const csvContent = `name,email,password,role,entryNumber,batch,phone,address,department,program,advisor,title,officialEmail
John Doe,student1@iitrpr.ac.in,password123,STUDENT,2024CSB1001,2024,+91-9876543210,Hostel A Room 101,CSE,BTECH-CSE,advisor@iitrpr.ac.in,,
Jane Smith,student2@iitrpr.ac.in,password123,STUDENT,2024EEB1002,2024,,,Electrical Engineering,BTECH-EE,,,
Dr. Rajesh Kumar,instructor1@iitrpr.ac.in,password123,INSTRUCTOR,,,,,Computer Science & Engineering,,,Dr.,instructor1@iitrpr.ac.in
Prof. Amit Sharma,instructor2@iitrpr.ac.in,password123,INSTRUCTOR,,,,,ME,,,Prof.,amit.sharma@iitrpr.ac.in`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_user_template.csv';
    a.click();
  };

  const getRoleBadge = (role: User['role']) => {
    const styles = {
      STUDENT: 'bg-blue-100 text-blue-800',
      INSTRUCTOR: 'bg-green-100 text-green-800',
      ADMIN: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[role]}`}>
        {role}
      </span>
    );
  };

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === 'STUDENT').length,
    instructors: users.filter((u) => u.role === 'INSTRUCTOR').length,
    advisors: users.filter((u) => u.instructor?.isAdvisor).length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
  };

  // Get unique departments for filter
  const departments = Array.from(
    new Set(
      users
        .map((u) => u.student?.department?.code || u.instructor?.department?.code)
        .filter(Boolean)
    )
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Result Modal */}
      {showUploadResult && uploadResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Bulk Upload Results</h2>
              <button
                onClick={() => setShowUploadResult(false)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{uploadResult.total}</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">Total Rows</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{uploadResult.created}</p>
                  <p className="mt-1 text-xs font-medium text-green-800">Created</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{uploadResult.failed}</p>
                  <p className="mt-1 text-xs font-medium text-red-800">Failed</p>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-red-900">Errors:</h3>
                  <div className="max-h-60 space-y-2 overflow-auto">
                    {uploadResult.errors.map((err, idx) => (
                      <div key={idx} className="rounded-lg bg-white p-3 text-xs">
                        <p className="font-semibold text-red-800">
                          Row {err.row}: {err.email}
                        </p>
                        <p className="mt-1 text-red-600">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowUploadResult(false)}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Help Modal */}
      {showCsvHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-900">CSV Bulk Upload Guide</h2>
              <button
                onClick={() => setShowCsvHelp(false)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* CSV Header */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">CSV Header Format</h3>
                <div className="rounded-lg bg-slate-900 p-4 overflow-x-auto">
                  <code className="text-xs text-green-400">
                    name,email,password,role,entryNumber,batch,phone,address,department,program,advisor,title,officialEmail
                  </code>
                </div>
              </div>

              {/* Field Reference Table */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Field Reference</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">Column</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">Required?</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">Accepted Values</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">Examples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">name</td>
                        <td className="px-4 py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Required</span></td>
                        <td className="px-4 py-2 text-slate-600">Any string</td>
                        <td className="px-4 py-2 text-slate-600">John Doe, Dr. Rajesh Kumar</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">email</td>
                        <td className="px-4 py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Required</span></td>
                        <td className="px-4 py-2 text-slate-600">Valid unique email</td>
                        <td className="px-4 py-2 text-slate-600">student@iitrpr.ac.in</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">password</td>
                        <td className="px-4 py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Required</span></td>
                        <td className="px-4 py-2 text-slate-600">Any string (will be hashed)</td>
                        <td className="px-4 py-2 text-slate-600">password123</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">role</td>
                        <td className="px-4 py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Required</span></td>
                        <td className="px-4 py-2 text-slate-600">STUDENT, INSTRUCTOR, ADVISOR, ADMIN</td>
                        <td className="px-4 py-2 text-slate-600">STUDENT (case-sensitive)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">entryNumber</td>
                        <td className="px-4 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">Required for STUDENT</span></td>
                        <td className="px-4 py-2 text-slate-600">Unique string</td>
                        <td className="px-4 py-2 text-slate-600">2024CSB1001</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">batch</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">Integer year</td>
                        <td className="px-4 py-2 text-slate-600">2024</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">phone</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">Phone number</td>
                        <td className="px-4 py-2 text-slate-600">+91-9876543210</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">address</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">Any string</td>
                        <td className="px-4 py-2 text-slate-600">Hostel A Room 101</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">department</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">Code or full name (case-insensitive)</td>
                        <td className="px-4 py-2 text-slate-600">CSE, Computer Science & Engineering</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">program</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">Code or full name (case-insensitive)</td>
                        <td className="px-4 py-2 text-slate-600">BTECH-CSE, B.Tech in Computer Science</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">advisor</td>
                        <td className="px-4 py-2"><span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">Required for STUDENT</span></td>
                        <td className="px-4 py-2 text-slate-600">Advisor's email (RECOMMENDED) or name. Must be an instructor with advisor role. Leave empty for instructors.</td>
                        <td className="px-4 py-2 text-slate-600">advisor@iitrpr.ac.in (preferred)</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">title</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">User's own title (for instructors/advisors, NOT their advisor)</td>
                        <td className="px-4 py-2 text-slate-600">Dr., Prof., Asst. Prof.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">officialEmail</td>
                        <td className="px-4 py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Optional</span></td>
                        <td className="px-4 py-2 text-slate-600">Email (for instructors, defaults to email)</td>
                        <td className="px-4 py-2 text-slate-600">rajesh.kumar@iitrpr.ac.in</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Department Options */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Department Options</h3>
                <p className="text-sm text-slate-600 mb-3">You can use either the department code OR the full name (case-insensitive):</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold text-sm text-slate-700 mb-2">Codes:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">CSE</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">EE</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">ME</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">CE</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">CH</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">MTH</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-mono">PHY</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold text-sm text-slate-700 mb-2">Full Names:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Computer Science & Engineering</li>
                      <li>• Electrical Engineering</li>
                      <li>• Mechanical Engineering</li>
                      <li>• Civil Engineering</li>
                      <li>• Chemical Engineering</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Complete Examples</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Student with Department Code:</p>
                    <div className="rounded-lg bg-slate-900 p-3 overflow-x-auto">
                      <code className="text-xs text-green-400 whitespace-nowrap">
                        Rahul Sharma,2024csb1001@iitrpr.ac.in,password123,STUDENT,2024CSB1001,2024,+91-9876543210,Hostel A,CSE,BTECH-CSE,advisor@iitrpr.ac.in,,
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Student with Full Department Name:</p>
                    <div className="rounded-lg bg-slate-900 p-3 overflow-x-auto">
                      <code className="text-xs text-green-400 whitespace-nowrap">
                        Priya Patel,2024eeb1002@iitrpr.ac.in,password123,STUDENT,2024EEB1002,2024,,,Electrical Engineering,BTECH-EE,,,
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Instructor:</p>
                    <div className="rounded-lg bg-slate-900 p-3 overflow-x-auto">
                      <code className="text-xs text-green-400 whitespace-nowrap">
                        Dr. Rajesh Kumar,rajesh.kumar@iitrpr.ac.in,password123,INSTRUCTOR,,,,,Computer Science & Engineering,,,Dr.,rajesh.kumar@iitrpr.ac.in
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
                <h3 className="text-sm font-bold text-yellow-900 mb-2">⚠️ Important Notes</h3>
                <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Role values are <strong>case-sensitive</strong> - use STUDENT, not student</li>
                  <li>Department and program names are <strong>case-insensitive</strong></li>
                  <li>Email addresses must be <strong>unique</strong> across all users</li>
                  <li>Entry numbers must be <strong>unique</strong> across all students</li>
                  <li><strong className="text-red-700">MANDATORY:</strong> The <code className="bg-yellow-200 px-1">advisor</code> field is <strong>REQUIRED for STUDENTS</strong>. Use advisor's <strong>email address</strong> (recommended) to avoid name clashes. Leave EMPTY for instructors.</li>
                  <li>The advisor must exist in the system as an <strong>instructor with advisor role</strong>. Check the instructors list to verify.</li>
                  <li>The <code className="bg-yellow-200 px-1">title</code> column is for the user's OWN title (Dr., Prof.), NOT their advisor's title</li>
                  <li>Leave optional fields empty (just use commas) if not needed</li>
                  <li>The system processes uploads in batches of 50 users</li>
                </ul>
              </div>

              <button
                onClick={() => setShowCsvHelp(false)}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Got it, Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Preview Modal */}
      {showValidationPreview && validationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-900">CSV Validation Results</h2>
              <p className="mt-2 text-sm text-slate-600">
                Review the validation results before uploading. Fix errors or proceed with valid rows only.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-3xl font-bold text-slate-900">{validationResult.total}</p>
                  <p className="mt-1 text-xs font-medium text-slate-600">Total Rows</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{validationResult.valid}</p>
                  <p className="mt-1 text-xs font-medium text-green-800">Will Succeed</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{validationResult.invalid}</p>
                  <p className="mt-1 text-xs font-medium text-red-800">Have Errors</p>
                </div>
              </div>

              {/* Success Message or Warning */}
              {validationResult.invalid === 0 ? (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">All rows are valid!</p>
                      <p className="text-sm text-green-700">All {validationResult.total} users will be created successfully.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900">Some rows have errors</p>
                      <p className="text-sm text-yellow-700">
                        {validationResult.valid} rows will be created, {validationResult.invalid} rows will be skipped due to errors.
                      </p>
                      <p className="mt-2 text-sm text-yellow-800">
                        You can proceed to upload only the valid rows, or cancel and fix the errors first.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      Error Details ({validationResult.errors.length} rows)
                    </h3>
                    <button
                      onClick={handleDownloadFailedRows}
                      className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                    >
                      <Download className="h-4 w-4" />
                      Download Failed Rows
                    </button>
                  </div>

                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="max-h-96 space-y-3 overflow-auto">
                      {validationResult.errors.map((err: any, idx: number) => (
                        <div key={idx} className="rounded-lg border border-red-200 bg-white p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                                  Row {err.row}
                                </span>
                                <span className="text-sm font-semibold text-slate-900">{err.email}</span>
                              </div>
                              <p className="mt-2 text-sm text-red-700">{err.error}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Valid Rows Preview */}
              {validationResult.valid > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Valid Rows Preview ({validationResult.valid} will be created)
                  </h3>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="max-h-60 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-green-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-green-900">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-green-900">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-green-900">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-green-900">Role</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-green-900">Department</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-green-200">
                          {validationResult.validRows?.slice(0, 20).map((row: any, idx: number) => (
                            <tr key={idx} className="bg-white">
                              <td className="px-3 py-2 text-xs text-slate-600">{row.rowNumber}</td>
                              <td className="px-3 py-2 text-xs font-medium text-slate-900">{row.name}</td>
                              <td className="px-3 py-2 text-xs text-slate-600">{row.email}</td>
                              <td className="px-3 py-2">
                                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${row.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                                  row.role === 'INSTRUCTOR' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                  {row.role}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-600">{row.department || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {validationResult.validRows && validationResult.validRows.length > 20 && (
                        <p className="mt-3 text-center text-xs text-green-700">
                          Showing first 20 of {validationResult.validRows.length} valid rows
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancelUpload}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel & Fix Errors
                </button>
                {validationResult.valid > 0 && (
                  <button
                    onClick={handleConfirmUpload}
                    disabled={uploading}
                    className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      `Proceed with ${validationResult.valid} Valid Row${validationResult.valid !== 1 ? 's' : ''}`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


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
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add User
              <ChevronDown className="h-4 w-4" />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 top-full z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="p-2">
                  <Link
                    href="/admin/users/add-student"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={() => setShowAddMenu(false)}
                  >
                    <GraduationCap className="h-5 w-5" />
                    Add Student
                  </Link>
                  <Link
                    href="/admin/users/add-instructor"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-green-50 hover:text-green-700"
                    onClick={() => setShowAddMenu(false)}
                  >
                    <UserPlus className="h-5 w-5" />
                    Add Instructor
                  </Link>
                </div>
              </div>
            )}
          </div>
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
            <p className="text-2xl font-bold text-green-600">{stats.instructors}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Instructors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.advisors}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Advisors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Admins</p>
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
            <Download className="h-5 w-5" />
            Download CSV Template
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100">
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload Users CSV
              </>
            )}
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">CSV Format Requirements:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
                <li><strong>Required:</strong> name, email, password, role</li>
                <li><strong>Role values:</strong> STUDENT, INSTRUCTOR, ADMIN (case-sensitive)</li>
                <li><strong>Students:</strong> entryNumber (required), department (CSE/EE/ME or full name), program, advisor (email/name)</li>
                <li><strong>Instructors:</strong> department (CSE/EE/ME or full name), title (Dr./Prof.), leave advisor EMPTY</li>
                <li><strong>Department:</strong> Use codes (CSE, EE, ME) or full names (Computer Science & Engineering)</li>
                <li className="text-red-700 font-semibold">⚠️ advisor column is for STUDENTS only - leave empty for instructors!</li>
              </ul>
            </div>
            <button
              onClick={() => setShowCsvHelp(true)}
              className="ml-4 flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <HelpCircle className="h-4 w-4" />
              View Full Guide
            </button>
          </div>
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
              placeholder="Search by name, email, or entry number..."
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
              <option value="STUDENT">Students</option>
              <option value="INSTRUCTOR">Instructors</option>
              <option value="ADVISOR">Advisors</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
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
                  ID/Entry Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Department
                </th>

              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {user.student?.entryNumber || user.instructor?.id.slice(0, 8) || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {user.student?.department?.code ||
                      user.instructor?.department?.code ||
                      'N/A'}
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

        <div className="mt-4 text-sm text-slate-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
