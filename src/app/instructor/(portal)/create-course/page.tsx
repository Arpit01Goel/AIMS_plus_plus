'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Search } from 'lucide-react';

interface CourseFormData {
  courseCode: string;
  courseName: string;
  department: string;
  category: string;
  degree: string;
  entryYears: string;
  session: string;
  slot: string;
  lectureHours: string;
  tutorialHours: string;
  practicalHours: string;
  selfStudyHours: string;
  credits: string;
  instructors: string[];
  allowedBatches: string[];
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

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: '',
    courseName: '',
    department: '',
    category: '',
    degree: 'B.Tech',
    entryYears: '',
    session: '2025-II',
    slot: '',
    lectureHours: '3',
    tutorialHours: '0',
    practicalHours: '0',
    selfStudyHours: '6',
    credits: '3',
    instructors: [],
    allowedBatches: [],
  });

  const [instructorSearch, setInstructorSearch] = useState('');
  const [batchInput, setBatchInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [availableInstructors, setAvailableInstructors] = useState<InstructorOption[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [currentInstructorName, setCurrentInstructorName] = useState<string>('');

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

        // Load current instructor profile
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

        setLoadingInstructors(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setLoadingCategories(false);
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
      
      const res = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: formData.courseCode.toUpperCase(),
          courseTitle: formData.courseName,
          department: formData.department,
          category: formData.category,
          ltpsc,
          credits: parseInt(formData.credits),
          sessionCode: formData.session,
          slot: formData.slot,
          capacity: 60, // Default capacity
        }),
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
          Create a new course offering for enrollment. Fill in all required details below.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Course Details</h2>
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">Select Department</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
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
                disabled={loadingCategories}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Entry Years <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 2019,2020"
                value={formData.entryYears}
                onChange={(e) => setFormData({ ...formData, entryYears: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="mt-1 text-xs text-slate-500">
                Comma-separated years eligible for this course
              </p>
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Tutorial</label>
              <input
                type="number"
                min="0"
                value={formData.tutorialHours}
                onChange={(e) => setFormData({ ...formData, tutorialHours: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Practical</label>
              <input
                type="number"
                min="0"
                value={formData.practicalHours}
                onChange={(e) => setFormData({ ...formData, practicalHours: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Self Study</label>
              <input
                type="number"
                min="0"
                value={formData.selfStudyHours}
                onChange={(e) => setFormData({ ...formData, selfStudyHours: e.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              <p className="text-sm text-slate-500">Loading your profile...</p>
            </div>
          )}
        </div>

        {/* Allowed Batches */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Allowed Batches</h2>
          <p className="mt-2 text-sm text-slate-600">
            Specify which student batches can enroll in this course
          </p>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g., B.Tech CSE 2021"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBatch())}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleAddBatch}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {formData.allowedBatches.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {formData.allowedBatches.map((batch) => (
                <div
                  key={batch}
                  className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5"
                >
                  <span className="text-sm text-slate-700">{batch}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBatch(batch)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
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
    </div>
  );
}
