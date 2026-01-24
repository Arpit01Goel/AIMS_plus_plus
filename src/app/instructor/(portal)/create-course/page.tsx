'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Search, BookOpen } from 'lucide-react';

interface CourseFormData {
  courseId?: string; // ID of selected existing course
  courseCode: string;
  courseName: string;
  department: string;
  category: string;
  degree: string;
  session: string;
  slot: string;
  lectureHours: string;
  tutorialHours: string;
  practicalHours: string;
  selfStudyHours: string;
  credits: string;
  instructors: string[];
  creditingRows: CreditingRow[];
}

interface CreditingRow {
  id: string;
  degree: string;
  department: string;
  category: string;
  entryYears: string;
}

interface InstructorOption {
  id: string;
  userId: string;
  name: string;
  email: string;
  title?: string;
  department?: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface ExistingCourse {
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
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: '',
    courseName: '',
    department: '',
    category: '',
    degree: 'B.Tech',
    session: '2025-II',
    slot: '',
    lectureHours: '3',
    tutorialHours: '0',
    practicalHours: '0',
    selfStudyHours: '6',
    credits: '3',
    instructors: [],
    creditingRows: [],
  });

  const [instructorSearch, setInstructorSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [departments, setDepartments] = useState<{ id: string; code: string; name: string; }[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [availableInstructors, setAvailableInstructors] = useState<InstructorOption[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [currentInstructorName, setCurrentInstructorName] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Course lookup states
  const [creatingNewCourse, setCreatingNewCourse] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [searchedCourses, setSearchedCourses] = useState<ExistingCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedExistingCourse, setSelectedExistingCourse] = useState<ExistingCourse | null>(null);

  // Load course categories and instructors from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const catRes = await fetch('/api/courses/categories');
        const catJson = await catRes.json();
        if (catRes.ok) {
          setCategories(catJson.categories || []);
        }
        setLoadingCategories(false);

        // Load departments
        const deptRes = await fetch('/api/departments');
        const deptJson = await deptRes.json();
        if (deptRes.ok) {
          setDepartments(deptJson || []);
        }
        setLoadingDepartments(false);

        // Load current instructor profile
        setLoadingProfile(true);
        const profileRes = await fetch('/api/profile');
        const profileJson = await profileRes.json();
        console.log('Profile response:', profileJson);
        if (profileRes.ok && profileJson.profile?.name) {
          const instructorName = profileJson.profile.name;
          setCurrentInstructorName(instructorName);
          // Preselect current instructor
          setFormData(prev => ({
            ...prev,
            instructors: [instructorName]
          }));
        }
        setLoadingProfile(false);
        setLoadingInstructors(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setLoadingCategories(false);
        setLoadingDepartments(false);
        setLoadingProfile(false);
        setLoadingInstructors(false);
      }
    };
    loadData();
  }, []);

  // Fetch instructors when user types in search
  useEffect(() => {
    const fetchInstructors = async () => {
      if (instructorSearch.trim().length < 2) {
        setAvailableInstructors([]);
        return;
      }

      try {
        setLoadingInstructors(true);
        const res = await fetch(`/api/instructors?search=${encodeURIComponent(instructorSearch)}`);
        const data = await res.json();
        if (res.ok) {
          setAvailableInstructors(data.instructors || []);
        }
      } catch (err) {
        console.error('Failed to fetch instructors:', err);
      } finally {
        setLoadingInstructors(false);
      }
    };

    const timeoutId = setTimeout(fetchInstructors, 300);
    return () => clearTimeout(timeoutId);
  }, [instructorSearch]);

  // Search for existing courses
  useEffect(() => {
    const searchCourses = async () => {
      if (courseSearchQuery.trim().length < 2) {
        setSearchedCourses([]);
        return;
      }

      try {
        setLoadingCourses(true);
        const res = await fetch(`/api/courses/search?q=${encodeURIComponent(courseSearchQuery)}`);
        const data = await res.json();
        if (res.ok) {
          setSearchedCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Failed to search courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    const timeoutId = setTimeout(searchCourses, 300);
    return () => clearTimeout(timeoutId);
  }, [courseSearchQuery]);

  // Pre-fill form when existing course is selected
  const handleSelectExistingCourse = (course: ExistingCourse) => {
    setSelectedExistingCourse(course);
    
    // Parse LTPSC if available
    let lecture = '3', tutorial = '0', practical = '0', selfStudy = '6';
    if (course.ltpsc) {
      const parts = course.ltpsc.split('-');
      if (parts.length >= 4) {
        lecture = parts[0];
        tutorial = parts[1];
        practical = parts[2];
        selfStudy = parts[3];
      }
    }

    // Pre-fill form data with course details
    setFormData(prev => ({
      ...prev,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.title,
      department: course.department?.name || prev.department,
      category: course.category,
      degree: course.degree || 'B.Tech',
      credits: course.credits.toString(),
      lectureHours: lecture,
      tutorialHours: tutorial,
      practicalHours: practical,
      selfStudyHours: selfStudy,
      // Keep existing: instructors, session, slot, creditingRows
    }));

    // Clear search
    setCourseSearchQuery('');
  };

  // Clear selected course and reset form
  const handleClearSelectedCourse = () => {
    setSelectedExistingCourse(null);
    setFormData(prev => ({
      ...prev,
      courseId: undefined,
      courseCode: '',
      courseName: '',
      department: '',
      category: '',
      degree: 'B.Tech',
      credits: '3',
      lectureHours: '3',
      tutorialHours: '0',
      practicalHours: '0',
      selfStudyHours: '6',
    }));
  };

  // Add crediting row
  const handleAddCreditingRow = () => {
    setFormData(prev => ({
      ...prev,
      creditingRows: [
        ...prev.creditingRows,
        {
          id: Math.random().toString(36).substr(2, 9),
          degree: 'B.Tech',
          department: '',
          category: '',
          entryYears: '',
        },
      ],
    }));
  };

  // Remove crediting row
  const handleRemoveCreditingRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      creditingRows: prev.creditingRows.filter(row => row.id !== id),
    }));
  };

  // Update crediting row
  const handleUpdateCreditingRow = (id: string, field: keyof CreditingRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      creditingRows: prev.creditingRows.map(row =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  const filteredInstructors = availableInstructors.filter(
    (instructor) =>
      !formData.instructors.includes(instructor.name)
  );

  const handleAddInstructor = (name: string) => {
    setFormData({
      ...formData,
      instructors: [...formData.instructors, name],
    });
    setInstructorSearch('');
  };

  const handleRemoveInstructor = (name: string) => {
    // Prevent removing the current instructor (course creator)
    if (name === currentInstructorName) {
      setError('You cannot remove yourself from the course');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setFormData({ 
      ...formData, 
      instructors: formData.instructors.filter((i) => i !== name) 
    });
  };

  const handleAddBatch = () => {
    if (batchInput.trim() && !formData.allowedBatches.includes(batchInput.trim())) {
      setFormData({
        ...formData,
        allowedBatches: [...formData.allowedBatches, batchInput.trim()],
      });
      setBatchInput('');
    }
  };

  const handleRemoveBatch = (batch: string) => {
    setFormData({
      ...formData,
      allowedBatches: formData.allowedBatches.filter((b) => b !== batch),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) return;
    
    // Validation
    if (!formData.courseCode || !formData.courseName || !formData.credits) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const ltpsc = calculateLTPSC();
      
      const payload: any = {
        sessionCode: formData.session,
        slot: formData.slot,
        capacity: 60, // Default capacity
      };

      // If using existing course, send courseId, otherwise send course details
      if (selectedExistingCourse && formData.courseId) {
        payload.courseId = formData.courseId;
      } else {
        payload.courseCode = formData.courseCode.toUpperCase();
        payload.courseTitle = formData.courseName;
        payload.department = formData.department;
        payload.category = formData.category;
        payload.degree = formData.degree;
        payload.ltpsc = ltpsc;
        payload.credits = parseInt(formData.credits);
      }
      
      const res = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create course offering');
      }

      alert('Course offering created successfully!');
      router.push('/instructor/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course offering');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateLTPSC = () => {
    return `${formData.lectureHours}-${formData.tutorialHours}-${formData.practicalHours}-${formData.selfStudyHours}-${formData.credits}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Course Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Float a New Course
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Search for an existing course or create a new one for enrollment.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Course Search Section - Primary Feature */}
      {!selectedExistingCourse && !creatingNewCourse && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-indigo-600" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">
              Search Existing Course
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Search from previously floated courses to reuse course details
            </p>

            {/* Search Input */}
            <div className="mx-auto mt-6 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by course code or name (e.g., CS201, Data Structures)..."
                  value={courseSearchQuery}
                  onChange={(e) => setCourseSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border-2 border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Search Results */}
              {loadingCourses && courseSearchQuery.length >= 2 && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
                    Searching courses...
                  </div>
                </div>
              )}

              {!loadingCourses && courseSearchQuery.length >= 2 && searchedCourses.length === 0 && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-center text-sm text-slate-600">No courses found</p>
                </div>
              )}

              {!loadingCourses && searchedCourses.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {searchedCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleSelectExistingCourse(course)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
                              {course.code}
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                              {course.category}
                            </span>
                            {course.degree && (
                              <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                {course.degree}
                              </span>
                            )}
                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              {course.credits} Credits
                            </span>
                          </div>
                          <h3 className="mt-2 font-semibold text-slate-900">
                            {course.title}
                          </h3>
                          {course.department && (
                            <p className="mt-1 text-sm text-slate-600">
                              {course.department.name}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-medium text-indigo-600">
                          Select →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-sm font-medium text-slate-500">OR</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {/* Create New Course Button */}
            <button
              type="button"
              onClick={() => setCreatingNewCourse(true)}
              className="mt-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
            >
              + Create a New Course Instead
            </button>
          </div>
        </div>
      )}

      {/* Form - Shows when course selected or creating new */}
      {(selectedExistingCourse || creatingNewCourse) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Course Details</h2>
              {selectedExistingCourse && (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Using: {selectedExistingCourse.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleClearSelectedCourse();
                      setCourseSearchQuery('');
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Back to Search
                  </button>
                </div>
              )}
              {creatingNewCourse && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatingNewCourse(false);
                    handleClearSelectedCourse();
                  }}
                  className="text-sm text-slate-600 hover:text-slate-700 font-medium"
                >
                  ← Back to Search
                </button>
              )}
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Course Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., CS502"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Course Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Data Structures and Algorithms"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={loadingDepartments || !!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              >
                <option value="">{loadingDepartments ? 'Loading departments...' : 'Select Department'}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loadingCategories || !!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-100"
              >
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  <>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Degree <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Session <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="2025-I">2025-I (Spring)</option>
                <option value="2025-II">2025-II (Fall)</option>
                <option value="2025-W">2025-W (Winter)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Slot / Timetable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., A1, Buffer slot"
                value={formData.slot}
                onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* LTPSC Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Credit Structure (L-T-P-S-C)</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Lecture</label>
              <input
                type="number"
                min="0"
                value={formData.lectureHours}
                onChange={(e) => setFormData({ ...formData, lectureHours: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Tutorial</label>
              <input
                type="number"
                min="0"
                value={formData.tutorialHours}
                onChange={(e) => setFormData({ ...formData, tutorialHours: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Practical</label>
              <input
                type="number"
                min="0"
                value={formData.practicalHours}
                onChange={(e) => setFormData({ ...formData, practicalHours: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Self Study</label>
              <input
                type="number"
                min="0"
                value={formData.selfStudyHours}
                onChange={(e) => setFormData({ ...formData, selfStudyHours: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Credits <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                disabled={!!selectedExistingCourse}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-600"
              />
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm font-semibold text-indigo-900">
              LTPSC Format: <span className="font-mono">{calculateLTPSC()}</span>
            </p>
          </div>
        </div>

        {/* Instructors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Course Instructors <span className="text-red-500">*</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add instructors to teach this course (you are added by default)
          </p>

          {/* Search Instructors */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Type to search instructors (min 2 characters)..."
              value={instructorSearch}
              onChange={(e) => setInstructorSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {loadingInstructors && instructorSearch.length >= 2 && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600"></div>
                  Searching instructors...
                </div>
              </div>
            )}
            {!loadingInstructors && instructorSearch.length >= 2 && filteredInstructors.length === 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <p className="text-center text-sm text-slate-600">No instructors found</p>
              </div>
            )}
            {!loadingInstructors && instructorSearch && filteredInstructors.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                {filteredInstructors.map((instructor) => (
                  <button
                    key={instructor.id}
                    type="button"
                    onClick={() => handleAddInstructor(instructor.name)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-medium text-slate-900">{instructor.name}</div>
                    <div className="text-xs text-slate-500">
                      {instructor.title && `${instructor.title} • `}
                      {instructor.department || instructor.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Instructors */}
          {formData.instructors.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.instructors.map((instructorName) => {
                const isCurrentUser = instructorName === currentInstructorName;
                return (
                  <div
                    key={instructorName}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900">{instructorName}</span>
                      {isCurrentUser && (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          You (Primary)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveInstructor(instructorName)}
                      disabled={isCurrentUser}
                      className="rounded-lg bg-red-100 p-1.5 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isCurrentUser ? 'You cannot remove yourself' : 'Remove instructor'}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {formData.instructors.length === 0 && (
            <div className="mt-4 text-center rounded-xl border border-slate-200 bg-slate-50 p-4">
              {loadingProfile ? (
                <p className="text-sm text-slate-500">Loading your profile...</p>
              ) : (
                <p className="text-sm text-slate-500">No instructors added yet. Search and add instructors above.</p>
              )}
            </div>
          )}
        </div>

        {/* Crediting Categorization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Crediting Categorization</h2>
              <p className="mt-1 text-sm text-slate-600">
                Specify which degree, department, and entry years can take this course for credit
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCreditingRow}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {formData.creditingRows.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      Degree
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">
                      For Entry Years
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.creditingRows.map((row, index) => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{index + 1}</td>
                      <td className="px-4 py-3">
                        <select
                          value={row.degree}
                          onChange={(e) => handleUpdateCreditingRow(row.id, 'degree', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="B.Tech">B.Tech</option>
                          <option value="M.Tech">M.Tech</option>
                          <option value="PhD">PhD</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.department}
                          onChange={(e) => handleUpdateCreditingRow(row.id, 'department', e.target.value)}
                          disabled={loadingDepartments}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                        >
                          {loadingDepartments ? (
                            <option>Loading...</option>
                          ) : (
                            <>
                              <option value="">Select Department</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.name}>
                                  {dept.code} - {dept.name}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.category}
                          onChange={(e) => handleUpdateCreditingRow(row.id, 'category', e.target.value)}
                          disabled={loadingCategories}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                        >
                          {loadingCategories ? (
                            <option>Loading...</option>
                          ) : (
                            <>
                              <option value="">Select Category</option>
                              {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          placeholder="e.g., 2019,2020"
                          value={row.entryYears}
                          onChange={(e) => handleUpdateCreditingRow(row.id, 'entryYears', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCreditingRow(row.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {formData.creditingRows.length === 0 && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-600">
                No crediting rules added yet. Click "Add" to define which students can take this course.
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/instructor/courses')}
            disabled={submitting}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Float Course for Enrollment'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
