"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Search,
  Filter,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Student {
  id: string;
  rollNo: string;
  name: string;
  grade: string;
  status: "submitted" | "pending";
}

interface Course {
  id: string;
  code: string;
  title: string;
  students: number;
}

interface GradeOption {
  value: string;
  label: string;
}

export default function GradesPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [csvValidationErrors, setCsvValidationErrors] = useState<
    Array<{ row: number; error: string }>
  >([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStudents, setUpdatingStudents] = useState<Set<string>>(
    new Set(),
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [originalGrades, setOriginalGrades] = useState<Map<string, string>>(
    new Map(),
  );
  const [gradeOptions, setGradeOptions] = useState<GradeOption[]>([]);

  const formatGradeLabel = (grade: string) => {
    if (!grade) return "";
    // Convert database format (A_MINUS) to display format (A-)
    return grade.replace("_MINUS", "-");
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadStudents();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const [coursesRes, gradesRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/grades/options"),
      ]);

      const coursesData = await coursesRes.json();
      const gradesData = await gradesRes.json();

      if (coursesRes.ok) {
        setCourses(coursesData.courses || []);
      }

      if (gradesRes.ok && gradesData.grades) {
        setGradeOptions(gradesData.grades);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch(`/api/grades?offeringId=${selectedCourse}`);
      const data = await res.json();
      if (res.ok && data.students) {
        const studentData = data.students.map((s: any) => ({
          id: s.enrollmentId,
          rollNo: s.entryNumber,
          name: s.name,
          grade: s.grade || "",
          status: s.grade ? "submitted" : "pending",
        }));
        setStudents(studentData);

        // Store original grades
        const gradesMap = new Map<string, string>();
        studentData.forEach((s: Student) => {
          gradesMap.set(s.id, s.grade);
        });
        setOriginalGrades(gradesMap);
      }
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleUpdateGrade = async (studentId: string) => {
    if (!selectedCourse) return;

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (!student.grade) {
      alert("Please select a grade before updating.");
      return;
    }

    try {
      setUpdatingStudents((prev) => new Set(prev).add(studentId));

      const res = await fetch("/api/grades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId: selectedCourse,
          grades: [
            {
              enrollmentId: studentId,
              grade: student.grade,
            },
          ],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update grade");
      }

      // Update student status to submitted
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, status: "submitted" as const } : s,
        ),
      );

      // Update original grade to the new value
      setOriginalGrades((prev) => new Map(prev).set(studentId, student.grade));

      alert(data.message || "Grade updated successfully!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update grade");
    } finally {
      setUpdatingStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!selectedCourse) {
      alert("Please select a course first");
      return;
    }

    const file = e.target.files[0];
    setUploadedFile(file);

    try {
      setUploadProcessing(true);
      setCsvValidationErrors([]);

      // Parse CSV
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file is empty or invalid");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toUpperCase());

      // Validate headers
      const requiredHeaders = ["ROLL_NO", "NAME", "GRADE"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingHeaders.length > 0) {
        alert(
          `Missing required columns: ${missingHeaders.join(", ")}. Please use the template.`,
        );
        return;
      }

      const rollNoIndex = headers.indexOf("ROLL_NO");
      const nameIndex = headers.indexOf("NAME");
      const gradeIndex = headers.indexOf("GRADE");

      const validGradeValues = new Set(gradeOptions.map((g) => formatGradeLabel(g.value)));
      const errors: Array<{ row: number; error: string }> = [];
      const gradeUpdates: Array<{ enrollmentId: string; grade: string }> = [];

      // Create a map of roll numbers to student enrollment IDs
      const rollNoMap = new Map(
        students.map((s) => [s.rollNo.toLowerCase(), s.id]),
      );

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const rowNumber = i + 1;
        const rollNo = values[rollNoIndex];
        const grade = values[gradeIndex];

        if (!rollNo) {
          errors.push({ row: rowNumber, error: "Missing roll number" });
          continue;
        }

        if (!grade) {
          errors.push({ row: rowNumber, error: "Missing grade" });
          continue;
        }

        // Check if student exists in the course
        const enrollmentId = rollNoMap.get(rollNo.toLowerCase());
        if (!enrollmentId) {
          errors.push({
            row: rowNumber,
            error: `Student ${rollNo} not found in this course`,
          });
          continue;
        }

        // Validate grade value
        if (!validGradeValues.has(grade)) {
          errors.push({
            row: rowNumber,
            error: `Invalid grade "${grade}". Use valid grade options. `,
          });
          continue;
        }

        const grade_db = grade.replace("-", "_MINUS");

        gradeUpdates.push({ enrollmentId, grade: grade_db });
      }

      console.log("Grade updates from CSV:", gradeUpdates);

      if (errors.length > 0) {
        setCsvValidationErrors(errors);
        alert(
          `Found ${errors.length} error(s) in the CSV. Please review and fix.`,
        );
        return;
      }

      // If validation passes, confirm upload
      if (gradeUpdates.length === 0) {
        alert("No valid grades to upload");
        return;
      }

      if (!confirm(`Upload ${gradeUpdates.length} grade(s) from CSV?`)) {
        return;
      }

      // Upload grades
      const res = await fetch("/api/grades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringId: selectedCourse,
          grades: gradeUpdates,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload grades");
      }

      alert(`Successfully uploaded ${gradeUpdates.length} grade(s)!`);

      // Reload students to reflect updated grades
      await loadStudents();
      setUploadedFile(null);
    } catch (error) {
      console.error("CSV upload error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process CSV file",
      );
    } finally {
      setUploadProcessing(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedCourse || students.length === 0) {
      alert("Please select a course with enrolled students first");
      return;
    }

    // Generate CSV template with actual student data
    const csvRows = students.map((s) => `${s.rollNo},${s.name},`);
    const csvContent = `ROLL_NO,NAME,GRADE\n${csvRows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCourse}_grade_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadGrades = () => {
    if (!selectedCourse || students.length === 0) {
      alert("No grades to download");
      return;
    }

    // Download submitted grades with actual data
    const csvContent = students
      .map(
        (s) =>
          `${s.rollNo},${s.name},${formatGradeLabel(s.grade) || "Not Assigned"}`,
      )
      .join("\n");
    const blob = new Blob([`ROLL_NO,NAME,GRADE\n${csvContent}`], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedCourse}_grades.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGradeChange = (studentId: string, newGrade: string) => {
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, grade: newGrade } : s)),
    );
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      gradeFilter === "all" ||
      (gradeFilter === "submitted" && student.status === "submitted") ||
      (gradeFilter === "pending" && student.status === "pending");
    return matchesSearch && matchesFilter;
  });

  const statusStats = {
    submitted: students.filter((s) => s.status === "submitted").length,
    pending: students.filter((s) => s.status === "pending").length,
  };

  const getStatusBadge = (status: Student["status"]) => {
    const styles = {
      submitted: { bg: "bg-blue-100", text: "text-blue-800", icon: FileText },
      pending: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        icon: AlertCircle,
      },
    };
    const { bg, text, icon: Icon } = styles[status];
    return (
      <span
        className={`flex items-center gap-1 justify-center rounded-full ${bg} ${text} px-2.5 py-1 text-xs font-semibold`}
      >
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Grade Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Upload & Manage Grades
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Upload grades via CSV or manually enter grades for your enrolled
          students
        </p>

        {/* Course Selector */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-slate-700">
            Select Course
          </label>
          {loading ? (
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 md:w-96">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"></div>
              <span className="text-sm text-slate-600">Loading courses...</span>
            </div>
          ) : (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:w-96"
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title} ({course.students} students)
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedCourse && (
          <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {statusStats.submitted}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">
                Submitted
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {statusStats.pending}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600">Pending</p>
            </div>
          </div>
        )}
      </div>

      {selectedCourse && (
        <>
          {/* Upload Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Upload Grades</h2>
            <p className="mt-2 text-sm text-slate-600">
              Upload grades in CSV format. Download the template to get started.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* Download Template */}
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Download className="h-5 w-5" />
                Download Grade Template
              </button>

              {/* Upload CSV */}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-6 py-4 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100">
                <Upload className="h-5 w-5" />
                {uploadProcessing ? "Processing..." : "Upload Grades CSV"}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadProcessing || !selectedCourse}
                />
              </label>
            </div>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Instructions:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
                <li>CSV file must have headers: ROLL_NO, NAME, GRADE</li>
                <li>Red rows indicate invalid grades</li>
                <li>Review grades before final submission</li>
                <li>
                  Once submitted, grades can be downloaded from the Download
                  Grades menu
                </li>
              </ul>
            </div>

            {/* CSV Validation Errors */}
            {csvValidationErrors.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  CSV Validation Errors ({csvValidationErrors.length}):
                </p>
                <div className="mt-2 max-h-48 overflow-y-auto">
                  <ul className="space-y-1 text-xs text-red-800">
                    {csvValidationErrors.map((err, idx) => (
                      <li key={idx}>
                        <strong>Row {err.row}:</strong> {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Student Grades List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Student Grades
              </h2>
              <button
                onClick={handleDownloadGrades}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Download Grades
              </button>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by roll number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-x-auto">
              {loadingStudents ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600"></div>
                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Loading students...
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        S#
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Roll No.
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Name
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {student.rollNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {student.name}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={student.grade}
                            onChange={(e) =>
                              handleGradeChange(student.id, e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="">-- Select --</option>
                            {gradeOptions.map((grade) => (
                              <option key={grade.value} value={grade.value}>
                                {grade.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(student.status)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleUpdateGrade(student.id)}
                            disabled={
                              updatingStudents.has(student.id) ||
                              student.grade === originalGrades.get(student.id)
                            }
                            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStudents.has(student.id)
                              ? "Updating..."
                              : "Update"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedCourse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No Course Selected
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Please select a course from the dropdown above to manage grades.
          </p>
        </div>
      )}
    </div>
  );
}
