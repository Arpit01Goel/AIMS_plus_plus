"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  Loader2,
  Search,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  X,
} from "lucide-react";

interface Department {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  programs: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  _count: {
    students: number;
    instructors: number;
    courses: number;
  };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [programFormCode, setProgramFormCode] = useState("");
  const [programFormName, setProgramFormName] = useState("");
  const [programFormLevel, setProgramFormLevel] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/departments");

      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }

      const data = await response.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setError("Failed to load departments. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formCode.trim() || !formName.trim()) {
      setError("Both department code and name are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/admin/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          name: formName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create department");
      }

      setSuccess("Department created successfully!");
      setFormCode("");
      setFormName("");
      setShowAddModal(false);

      await fetchDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error creating department:", error);
      setError(error.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    setError(null);
    setSuccess(null);

    if (!formCode.trim() || !formName.trim()) {
      setError("Both department code and name are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/admin/departments/${selectedDept.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: formCode.trim().toUpperCase(),
            name: formName.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update department");
      }

      setSuccess("Department updated successfully!");
      setFormCode("");
      setFormName("");
      setShowEditModal(false);
      setSelectedDept(null);

      await fetchDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error updating department:", error);
      setError(error.message || "Failed to update department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDept) return;

    setError(null);
    setSuccess(null);

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/admin/departments/${selectedDept.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || "Failed to delete department",
        );
      }

      setSuccess("Department deleted successfully!");
      setShowDeleteModal(false);
      setSelectedDept(null);

      await fetchDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error deleting department:", error);
      setError(error.message || "Failed to delete department");
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setFormCode(dept.code);
    setFormName(dept.name);
    setShowEditModal(true);
    setError(null);
  };

  const openDeleteModal = (dept: Department) => {
    setSelectedDept(dept);
    setShowDeleteModal(true);
    setError(null);
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;

    setError(null);
    setSuccess(null);

    if (!programFormCode.trim() || !programFormName.trim()) {
      setError("Both program code and name are required");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: programFormCode.trim().toUpperCase(),
          name: programFormName.trim(),
          level: programFormLevel || null,
          departmentId: selectedDept.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create program");
      }

      setSuccess("Program created successfully!");
      setProgramFormCode("");
      setProgramFormName("");
      setProgramFormLevel("");
      setShowAddProgramModal(false);
      setSelectedDept(null);

      await fetchDepartments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error creating program:", error);
      setError(error.message || "Failed to create program");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = {
    total: departments.length,
    totalStudents: departments.reduce(
      (sum, dept) => sum + dept._count.students,
      0,
    ),
    totalInstructors: departments.reduce(
      (sum, dept) => sum + dept._count.instructors,
      0,
    ),
    totalCourses: departments.reduce(
      (sum, dept) => sum + dept._count.courses,
      0,
    ),
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Add New Department
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Create a new department in the system
              </p>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label
                  htmlFor="add-code"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Department Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="add-code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CSE, EE, ME"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use uppercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label
                  htmlFor="add-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Department Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="add-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Computer Science & Engineering"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormCode("");
                    setFormName("");
                    setError(null);
                  }}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Department"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Edit Department
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Update department information
              </p>
            </div>

            <form onSubmit={handleEditDepartment} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-code"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Department Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="edit-code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CSE, EE, ME"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                  maxLength={10}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use uppercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label
                  htmlFor="edit-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Department Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Computer Science & Engineering"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedDept(null);
                    setFormCode("");
                    setFormName("");
                    setError(null);
                  }}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    "Update Department"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Delete Department
                  </h2>
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete the department{" "}
                <strong>{selectedDept.code}</strong> ({selectedDept.name})?
              </p>

              {(selectedDept._count.students > 0 ||
                selectedDept._count.instructors > 0 ||
                selectedDept._count.courses > 0) && (
                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-xs font-semibold text-yellow-900 mb-2">
                    ⚠️ Warning
                  </p>
                  <p className="text-xs text-yellow-800">
                    This department has:
                  </p>
                  <ul className="mt-2 text-xs text-yellow-800 list-disc list-inside">
                    {selectedDept._count.students > 0 && (
                      <li>{selectedDept._count.students} student(s)</li>
                    )}
                    {selectedDept._count.instructors > 0 && (
                      <li>{selectedDept._count.instructors} instructor(s)</li>
                    )}
                    {selectedDept._count.courses > 0 && (
                      <li>{selectedDept._count.courses} course(s)</li>
                    )}
                  </ul>
                  <p className="mt-2 text-xs text-yellow-800">
                    You cannot delete this department until these are reassigned
                    or removed.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDept(null);
                }}
                className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDepartment}
                disabled={
                  submitting ||
                  selectedDept._count.students > 0 ||
                  selectedDept._count.instructors > 0 ||
                  selectedDept._count.courses > 0
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Department"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Program Modal */}
      {showAddProgramModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add Program</h2>
              <p className="mt-2 text-sm text-slate-600">
                Add a new program to {selectedDept.name}
              </p>
            </div>

            <form onSubmit={handleAddProgram} className="space-y-4">
              <div>
                <label
                  htmlFor="program-code"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Program Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="program-code"
                  value={programFormCode}
                  onChange={(e) =>
                    setProgramFormCode(e.target.value.toUpperCase())
                  }
                  placeholder="e.g., BTECH-CSE, MTECH-DS"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-mono uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                  maxLength={20}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use uppercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label
                  htmlFor="program-name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Program Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="program-name"
                  value={programFormName}
                  onChange={(e) => setProgramFormName(e.target.value)}
                  placeholder="e.g., B.Tech in Computer Science & Engineering"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="program-level"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Program Level
                </label>
                <select
                  id="program-level"
                  value={programFormLevel}
                  onChange={(e) => setProgramFormLevel(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select level (optional)</option>
                  <option value="UG">Undergraduate</option>
                  <option value="PG">Postgraduate</option>
                  <option value="PhD">Doctorate</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProgramModal(false);
                    setSelectedDept(null);
                    setProgramFormCode("");
                    setProgramFormName("");
                    setProgramFormLevel("");
                    setError(null);
                  }}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Add Program"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Department Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Departments
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Manage academic departments and their organizational structure
            </p>
          </div>
          <button
            onClick={() => {
              setFormCode("");
              setFormName("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Total Departments
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalStudents}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Total Students
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.totalInstructors}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Total Instructors
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalCourses}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Total Courses
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-3 pl-12 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {searchQuery ? "No departments found" : "No departments yet"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first department"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  setFormCode("");
                  setFormName("");
                  setShowAddModal(true);
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add First Department
              </button>
            )}
          </div>
        ) : (
          filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {dept.code}
                    </h3>
                    <p className="text-xs text-slate-500">Department</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDept(dept);
                      setProgramFormCode("");
                      setProgramFormName("");
                      setProgramFormLevel("");
                      setShowAddProgramModal(true);
                      setError(null);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-green-50 hover:text-green-600"
                    title="Add program"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(dept)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    title="Edit department"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(dept)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-slate-700">
                {dept.name}
              </p>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-lg font-bold text-blue-600">
                      {dept._count.students}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Students</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                    <p className="text-lg font-bold text-green-600">
                      {dept._count.instructors}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Instructors</p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <p className="text-lg font-bold text-purple-600">
                      {dept._count.courses}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Courses</p>
                </div>
              </div>

              {/* Programs */}
              {dept.programs.length > 0 && (
                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Programs ({dept.programs.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.programs.slice(0, 3).map((program) => (
                      <span
                        key={program.id}
                        className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
                        title={program.name}
                      >
                        {program.code}
                      </span>
                    ))}
                    {dept.programs.length > 3 && (
                      <span className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600">
                        +{dept.programs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
