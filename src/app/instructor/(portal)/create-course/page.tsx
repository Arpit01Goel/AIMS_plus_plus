'use client';

import { useState } from 'react';
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
  instructors: { name: string; isCoordinator: boolean }[];
  allowedBatches: string[];
}

export default function CreateCoursePage() {
  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: '',
    courseName: '',
    department: '',
    category: 'Core',
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

  // Sample instructor list (will be fetched from database later)
  const availableInstructors = [
    'Dr. Nitin Auluck',
    'Dr. Rajesh Kumar',
    'Dr. Priya Sharma',
    'Dr. Vikram Mehta',
    'Dr. Anita Verma',
    'Dr. Amit Singh',
  ];

  const filteredInstructors = availableInstructors.filter(
    (instructor) =>
      instructor.toLowerCase().includes(instructorSearch.toLowerCase()) &&
      !formData.instructors.some((i) => i.name === instructor)
  );

  const handleAddInstructor = (name: string) => {
    setFormData({
      ...formData,
      instructors: [...formData.instructors, { name, isCoordinator: formData.instructors.length === 0 }],
    });
    setInstructorSearch('');
  };

  const handleRemoveInstructor = (name: string) => {
    const updatedInstructors = formData.instructors.filter((i) => i.name !== name);
    // If removing coordinator, make first instructor the coordinator
    if (updatedInstructors.length > 0 && !updatedInstructors.some((i) => i.isCoordinator)) {
      updatedInstructors[0].isCoordinator = true;
    }
    setFormData({ ...formData, instructors: updatedInstructors });
  };

  const handleToggleCoordinator = (name: string) => {
    setFormData({
      ...formData,
      instructors: formData.instructors.map((i) => ({
        ...i,
        isCoordinator: i.name === name,
      })),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Course Data:', formData);
    // Will integrate with backend API later
    alert('Course creation will be integrated with backend!');
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
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
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
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Core">Core</option>
                <option value="Elective">Elective</option>
                <option value="Open Elective">Open Elective</option>
                <option value="Project">Project</option>
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
            Add instructors and mark one as course coordinator
          </p>

          {/* Search Instructors */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search and add instructors..."
              value={instructorSearch}
              onChange={(e) => setInstructorSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {instructorSearch && filteredInstructors.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                {filteredInstructors.map((instructor) => (
                  <button
                    key={instructor}
                    type="button"
                    onClick={() => handleAddInstructor(instructor)}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-indigo-50"
                  >
                    {instructor}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Instructors */}
          {formData.instructors.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.instructors.map((instructor) => (
                <div
                  key={instructor.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">{instructor.name}</span>
                    {instructor.isCoordinator && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        Coordinator
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!instructor.isCoordinator && (
                      <button
                        type="button"
                        onClick={() => handleToggleCoordinator(instructor.name)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Set as Coordinator
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveInstructor(instructor.name)}
                      className="rounded-lg bg-red-100 p-1.5 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
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
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Float Course for Enrollment
          </button>
        </div>
      </form>
    </div>
  );
}
