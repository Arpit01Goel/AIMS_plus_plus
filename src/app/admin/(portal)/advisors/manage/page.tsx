"use client";

import { useState, useEffect } from "react";
import {
  Search,
  UserCog,
  Upload,
  Check,
  X,
  AlertCircle,
  Download,
} from "lucide-react";

interface Instructor {
  id: string;
  userId: string;
  title: string | null;
  officialEmail: string | null;
  isAdvisor: boolean;
  primaryCohort: number | null;
  advisorNotes: string | null;
  user: {
    name: string | null;
    email: string;
  };
  department: {
    id: string;
    code: string;
    name: string;
  } | null;
  _count?: {
    advisees: number;
  };
}

export default function AdvisorManagementPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "advisors" | "non-advisors"
  >("all");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/instructors");
      if (!response.ok) throw new Error("Failed to fetch instructors");
      const data = await response.json();
      setInstructors(data.instructors || []);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdvisorStatus = async (
    instructorId: string,
    currentStatus: boolean,
  ) => {
    if (
      !confirm(
        `Are you sure you want to ${currentStatus ? "remove advisor status from" : "make"} this instructor ${currentStatus ? "" : "an advisor"}?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/instructors/${instructorId}/advisor-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAdvisor: !currentStatus }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update advisor status");
      }

      await fetchInstructors();
      alert(`Advisor status updated successfully!`);
    } catch (error: any) {
      console.error("Error updating advisor status:", error);
      alert(error.message || "Failed to update advisor status");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert("Please select a CSV file");
      return;
    }

    try {
      setBulkProcessing(true);
      setBulkResults(null);

      const text = await bulkFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const emailIndex = headers.indexOf("email");
      const isAdvisorIndex = headers.indexOf("isadvisor");
      const cohortIndex = headers.indexOf("primarycohort");
      const notesIndex = headers.indexOf("advisornotes");

      if (emailIndex === -1 || isAdvisorIndex === -1) {
        throw new Error('CSV must contain "email" and "isAdvisor" columns');
      }

      const instructorUpdates = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const email = values[emailIndex];
        const isAdvisorValue = values[isAdvisorIndex]?.toLowerCase();
        const isAdvisor =
          isAdvisorValue === "true" ||
          isAdvisorValue === "yes" ||
          isAdvisorValue === "1";
        const primaryCohort =
          cohortIndex >= 0 ? parseInt(values[cohortIndex]) || null : null;
        const advisorNotes =
          notesIndex >= 0 ? values[notesIndex] || null : null;

        if (email) {
          instructorUpdates.push({
            email,
            isAdvisor,
            primaryCohort,
            advisorNotes,
          });
        }
      }

      const response = await fetch(
        "/api/admin/instructors/bulk-advisor-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instructors: instructorUpdates }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process bulk update");
      }

      const results = await response.json();
      setBulkResults(results);
      await fetchInstructors();
    } catch (error: any) {
      console.error("Error processing bulk upload:", error);
      alert(error.message || "Failed to process bulk upload");
    } finally {
      setBulkProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csv =
      "email,isAdvisor,primaryCohort,advisorNotes\ninstructor@iitrpr.ac.in,true,2023,Senior advisor for CS department";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "advisor_status_template.csv";
    a.click();
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const matchesSearch =
      instructor.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" ||
      instructor.department?.code === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "advisors" && instructor.isAdvisor) ||
      (statusFilter === "non-advisors" && !instructor.isAdvisor);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(
    new Set(instructors.map((i) => i.department?.code).filter(Boolean)),
  );
  const advisorCount = instructors.filter((i) => i.isAdvisor).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Instructor Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Advisor Status Management
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Manage which instructors serve as student advisors
            </p>
          </div>
          {/* <button
                        onClick={() => setShowBulkUpload(!showBulkUpload)}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <Upload className="h-4 w-4" />
                        Bulk Update
                    </button> */}
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {instructors.length}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Total Instructors
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{advisorCount}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Active Advisors
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {instructors.length - advisorCount}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Non-Advisors
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Bulk Advisor Status Update
            </h2>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>

          <div className="mb-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="cursor-pointer text-sm text-slate-600 hover:text-slate-900"
            >
              {bulkFile ? (
                <span className="font-medium text-indigo-600">
                  {bulkFile.name}
                </span>
              ) : (
                <span>Click to select CSV file or drag and drop</span>
              )}
            </label>
          </div>

          <button
            onClick={handleBulkUpload}
            disabled={!bulkFile || bulkProcessing}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkProcessing ? "Processing..." : "Upload and Process"}
          </button>

          {bulkResults && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Results</h3>
              <div className="space-y-2 text-sm">
                <p>Total: {bulkResults.total}</p>
                <p className="text-green-600">Success: {bulkResults.success}</p>
                <p className="text-red-600">Failed: {bulkResults.failed}</p>
                {bulkResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {bulkResults.errors.map((err: any, idx: number) => (
                        <li key={idx}>
                          {err.email}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="advisors">Advisors Only</option>
            <option value="non-advisors">Non-Advisors Only</option>
          </select>
        </div>
      </div>

      {/* Instructors Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-600">
            Loading instructors...
          </div>
        ) : filteredInstructors.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No instructors found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Instructor
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Department
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                        Primary Cohort
                                    </th> */}
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstructors.map((instructor) => (
                  <tr
                    key={instructor.id}
                    className="hover:bg-slate-50 text-center transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-900">
                          {instructor.user.name || "N/A"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {instructor.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {instructor.department?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {instructor.isAdvisor ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <Check className="h-3 w-3" />
                          Advisor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <X className="h-3 w-3" />
                          Not Advisor
                        </span>
                      )}
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-slate-700">
                                            {instructor.primaryCohort || '-'}
                                        </td> */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          toggleAdvisorStatus(
                            instructor.id,
                            instructor.isAdvisor,
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                          instructor.isAdvisor
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        <UserCog className="h-4 w-4" />
                        {instructor.isAdvisor
                          ? "Remove Advisor"
                          : "Make Advisor"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
