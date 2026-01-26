"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UserCog,
  Plus,
  Edit,
  Trash,
  Users,
  Settings,
} from "lucide-react";

interface Advisor {
  id: string;
  userId: string;
  title: string | null;
  officialEmail: string | null;
  isAdvisor: boolean;
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

export default function BatchAdvisorsPage() {
  const router = useRouter();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/advisors");
      if (!response.ok) throw new Error("Failed to fetch advisors");
      const data = await response.json();
      setAdvisors(data.advisors || []);
    } catch (error) {
      console.error("Error fetching advisors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch =
      advisor.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" ||
      advisor.department?.code === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(
    new Set(advisors.map((a) => a.department?.code).filter(Boolean)),
  );
  const totalStudents = advisors.reduce(
    (sum, a) => sum + (a._count?.advisees || 0),
    0,
  );

  const stats = {
    total: advisors.length,
    totalStudents: totalStudents,
    avgStudentsPerAdvisor:
      advisors.length > 0 ? Math.round(totalStudents / advisors.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Batch Advisors
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Advisor Assignments
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Assign faculty members as batch advisors to mentor student groups
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/advisors/manage")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Settings className="h-4 w-4" />
              Manage Advisor Status
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Active Advisors
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
              {stats.avgStudentsPerAdvisor}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Avg per Advisor
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Advisor List</h2>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by advisor name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
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

        {/* Advisors List */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-600">
              Loading advisors...
            </div>
          ) : filteredAdvisors.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No advisors found. Use "Manage Advisor Status" to assign
              instructors as advisors.
            </div>
          ) : (
            filteredAdvisors.map((advisor) => (
              <div
                key={advisor.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <UserCog className="h-7 w-7 text-indigo-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {advisor.user.name || "N/A"}
                        </h3>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                        <span>
                          {advisor.department?.name || "No Department"}
                        </span>
                        <span>{advisor.user.email}</span>
                        <span className="flex items-center gap-1 font-semibold text-indigo-600">
                          <Users className="h-3.5 w-3.5" />
                          {advisor._count?.advisees || 0} students
                        </span>
                      </div>
                    </div>
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
