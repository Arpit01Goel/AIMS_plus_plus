'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Upload, Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  ltpsc: string | null;
  category: string;
  degree: string | null;
  department: {
    id: string;
    code: string;
    name: string;
  } | null;
  offeringsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
}

export default function CourseManagementPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [searchQuery, categoryFilter, deptFilter]);

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (deptFilter !== 'all') params.append('departmentId', deptFilter);

      const response = await fetch(`/api/admin/courses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');

      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(courseId);
      const response = await fetch(`/api/admin/courses?courseId=${courseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete course');
        return;
      }

      alert('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      alert('Bulk course upload will be integrated with backend API!');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = 'code,title,credits,ltpsc,category,degree,departmentCode\nCS999,Sample Course,4,3-0-2-6-4,SC,B.Tech,CSE\nEE101,Circuit Theory,3,3-0-0-6-3,PC,B.Tech,EE';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_course_template.csv';
    a.click();
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      SC: 'bg-blue-100 text-blue-800',
      SE: 'bg-purple-100 text-purple-800',
      GR: 'bg-green-100 text-green-800',
      PC: 'bg-indigo-100 text-indigo-800',
      PE: 'bg-orange-100 text-orange-800',
      HC: 'bg-pink-100 text-pink-800',
      HE: 'bg-yellow-100 text-yellow-800',
      CP: 'bg-teal-100 text-teal-800',
      CT: 'bg-cyan-100 text-cyan-800',
      NN: 'bg-slate-100 text-slate-800',
      OC: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[category] || 'bg-slate-100 text-slate-800'}`}>
        {category}
      </span>
    );
  };

  const stats = {
    total: courses.length,
    withOfferings: courses.filter((c) => c.offeringsCount > 0).length,
    noOfferings: courses.filter((c) => c.offeringsCount === 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Course Catalog
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Course Catalog
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Create, edit, and approve courses in the academic catalog
            </p>
          </div>
          <Link
            href="/admin/courses/create"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">Total Courses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.withOfferings}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">With Offerings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.noOfferings}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">No Offerings</p>
          </div>
        </div>
      </div>

      {/* Bulk Upload */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Bulk Course Upload</h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload CSV file to create multiple courses. System auto-calculates Study hours and Credits from LTP.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <Upload className="h-5 w-5" />
            Download CSV Template
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100">
            <Upload className="h-5 w-5" />
            Upload Courses CSV
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Auto-Calculation Logic:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
            <li>Input: L-T-P (e.g., 3-1-2)</li>
            <li>Study Hours (S) = 2*L - T + 0.5*P = 2*3 - 1 + 0.5*2 = 6</li>
            <li>Credits (C) = L + 0.5*P = 3 + 0.5*2 = 4</li>
            <li>Output: L-T-P-S-C (e.g., 3-1-2-6-4)</li>
          </ul>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Course Catalog</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Categories</option>
              <option value="SC">SC - Science Core</option>
              <option value="SE">SE - Science Elective</option>
              <option value="GR">GR - Graduate</option>
              <option value="PC">PC - Program Core</option>
              <option value="PE">PE - Program Elective</option>
              <option value="HC">HC - Humanities Core</option>
              <option value="HE">HE - Humanities Elective</option>
              <option value="CP">CP - Capstone</option>
              <option value="CT">CT - Co-Taught</option>
              <option value="NN">NN - Non-Credit</option>
              <option value="OC">OC - Other</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Cards */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-600">No courses found matching your filters.</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <FileText className="h-7 w-7 text-indigo-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{course.code}</h3>
                        {getCategoryBadge(course.category)}
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">{course.title}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        {course.ltpsc && <span className="font-medium">LTPSC: {course.ltpsc}</span>}
                        <span>{course.credits} Credits</span>
                        {course.degree && <span>{course.degree}</span>}
                        {course.department && <span>{course.department.code} - {course.department.name}</span>}
                        <span>{course.offeringsCount} Offering{course.offeringsCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deleting === course.id}
                      className="flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleting === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
