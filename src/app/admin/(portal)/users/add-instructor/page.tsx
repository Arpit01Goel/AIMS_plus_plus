"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface Department {
  id: string;
  code: string;
  name: string;
}

export default function AddInstructorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [uploading, setUploading] = useState(false);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [showValidationPreview, setShowValidationPreview] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<any[]>([]);

  const [departments, setDepartments] = useState<Department[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    officialEmail: "",
    departmentId: "",
  });

  // Prefill email and name from query params (from signup request)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");

    if (emailParam || nameParam) {
      setFormData((prev) => ({
        ...prev,
        ...(emailParam && { email: emailParam }),
        ...(nameParam && { name: nameParam }),
      }));
    }
  }, [searchParams]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);

        const response = await fetch("/api/admin/departments");

        if (!response.ok) {
          throw new Error("Failed to fetch departments");
        }

        const data = await response.json();
        setDepartments(data.departments || []);
      } catch (err) {
        setError("Failed to load form data. Please refresh the page.");
        console.error("Error fetching data:", err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Generate random 8-digit password
      const randomPassword = Math.random().toString(36).slice(2, 10);

      const response = await fetch("/api/admin/instructors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, password: randomPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create instructor");
      }

      setSuccess("Instructor created successfully!");
      setTimeout(() => {
        router.push("/admin/users");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create instructor");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    try {
      setUploading(true);

      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        setError("CSV file is empty or invalid");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const instructorsData = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const instructorData: any = {
          role: "INSTRUCTOR",
          password: Math.random().toString(36).slice(2, 10),
        };

        headers.forEach((header, index) => {
          instructorData[header] = values[index] || "";
        });

        instructorsData.push(instructorData);
      }

      const response = await fetch("/api/admin/bulk-upload/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: instructorsData }),
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResult(result);
        setPendingUploadData(instructorsData);
        setShowValidationPreview(true);
      } else {
        setError(result.error || "Validation failed");
      }
    } catch (error) {
      console.error("CSV parsing error:", error);
      setError("Failed to process CSV file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    try {
      setUploading(true);
      setShowValidationPreview(false);

      const response = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: pendingUploadData }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(
          `Successfully created ${result.results.created} instructors!`,
        );
        setTimeout(() => router.push("/admin/users"), 2000);
      } else {
        setError(result.error || "Bulk upload failed");
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      setError("Failed to upload instructors");
    } finally {
      setUploading(false);
      setPendingUploadData([]);
      setValidationResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = `name,email,title,officialEmail,department
Dr. Rajesh Kumar,rajesh@iitrpr.ac.in,Dr.,rajesh.kumar@iitrpr.ac.in,CSE
Prof. Amit Sharma,amit@iitrpr.ac.in,Prof.,,Computer Science & Engineering`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "instructors_bulk_upload_template.csv";
    a.click();
  };

  if (fetchingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-slate-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CSV Help Modal */}
      {showCsvHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Instructor CSV Upload Guide
              </h2>
              <button
                onClick={() => setShowCsvHelp(false)}
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  CSV Header Format
                </h3>
                <div className="rounded-lg bg-slate-900 p-4 overflow-x-auto">
                  <code className="text-xs text-green-400">
                    name,email,title,officialEmail,department
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Field Reference
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">
                          Column
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">
                          Required?
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-700 border-b">
                          Examples
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">
                          name
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                            Required
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          Dr. Rajesh Kumar
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">
                          email
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                            Required
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          instructor@iitrpr.ac.in
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">
                          title
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Optional
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          Dr., Prof., Asst. Prof.
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">
                          officialEmail
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Optional
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          rajesh.kumar@iitrpr.ac.in
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-xs bg-blue-50">
                          department
                        </td>
                        <td className="px-4 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                            Optional
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600">
                          CSE or Computer Science & Engineering
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
                <h3 className="text-sm font-bold text-yellow-900 mb-2">
                  ⚠️ Important Notes
                </h3>
                <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Email addresses must be unique</li>
                  <li>
                    Passwords will be automatically generated for all
                    instructors
                  </li>
                  <li>
                    Department can use codes (CSE, EE) or full names
                    (case-insensitive)
                  </li>
                  <li>Leave advisor field EMPTY for instructors</li>
                  <li>officialEmail defaults to login email if not provided</li>
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
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-6">
              <h2 className="text-2xl font-bold text-slate-900">
                CSV Validation Results
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-3xl font-bold text-slate-900">
                    {validationResult.total}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Total Rows
                  </p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {validationResult.valid}
                  </p>
                  <p className="mt-1 text-xs font-medium text-green-800">
                    Valid
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {validationResult.invalid}
                  </p>
                  <p className="mt-1 text-xs font-medium text-red-800">
                    Errors
                  </p>
                </div>
              </div>

              {validationResult.invalid === 0 ? (
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <p className="font-semibold text-green-900">
                      All {validationResult.total} instructors are valid!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900">
                        Some rows have errors
                      </p>
                      <p className="text-sm text-yellow-700">
                        {validationResult.valid} will be created,{" "}
                        {validationResult.invalid} will be skipped.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {validationResult.errors &&
                validationResult.errors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <h3 className="font-bold text-red-900 mb-3">Errors:</h3>
                    <div className="max-h-60 space-y-2 overflow-auto">
                      {validationResult.errors.map((err: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-white p-3 text-xs"
                        >
                          <p className="font-semibold text-red-800">
                            Row {err.row}: {err.email}
                          </p>
                          <p className="mt-1 text-red-600">{err.error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowValidationPreview(false);
                    setPendingUploadData([]);
                    setValidationResult(null);
                  }}
                  className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
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
                      `Create ${validationResult.valid} Instructor${validationResult.valid !== 1 ? "s" : ""}`
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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              User Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Add New Instructor
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Create a new instructor account with department assignment
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Bulk Instructor Upload
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload CSV file to create multiple instructors at once
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            <Download className="h-5 w-5" />
            Download Instructor CSV Template
          </button>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-green-300 bg-green-50 px-6 py-4 text-sm font-semibold text-green-700 transition hover:border-green-400 hover:bg-green-100">
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload Instructors CSV
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
              <p className="text-sm font-semibold text-blue-900">CSV Format:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
                <li>
                  <strong>Required:</strong> name, email
                </li>
                <li>
                  <strong>Optional:</strong> title, officialEmail, department
                </li>
                <li>Passwords will be auto-generated for all instructors</li>
                <li>Department: Use codes (CSE, EE) or full names</li>
                <li className="text-red-700 font-semibold">
                  ⚠️ Leave advisor field EMPTY for instructors
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowCsvHelp(true)}
              className="ml-4 flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <HelpCircle className="h-4 w-4" />
              Full Guide
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">{success}</p>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Basic Information
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., Dr. Rajesh Kumar"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Title
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Title</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Asst. Prof.">Asst. Prof.</option>
                  <option value="Assoc. Prof.">Assoc. Prof.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Login Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., instructor@iitrpr.ac.in"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Official Email
                </label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., rajesh.kumar@iitrpr.ac.in"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Leave blank to use login email. A random password will be
                  generated automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Department Information */}
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Department Assignment
            </h2>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700">
                Department
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-6">
            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Instructor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
