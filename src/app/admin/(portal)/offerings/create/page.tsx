'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

interface Course {
    id: string;
    code: string;
    title: string;
}

interface Instructor {
    id: string;
    user: {
        name: string | null;
    };
}

interface Session {
    id: string;
    code: string;
    isCurrent: boolean;
}

export default function FloatOfferingPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        courseId: '',
        academicSessionId: '',
        instructorId: '',
        capacity: '60',
        slot: '',
        status: 'ENROLLING',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, instructorsRes, offeringsRes] = await Promise.all([
                fetch('/api/admin/courses'),
                fetch('/api/admin/instructors'),
                fetch('/api/admin/offerings'), // To get sessions
            ]);

            const coursesData = await coursesRes.json();
            const instructorsData = await instructorsRes.json();
            const offeringsData = await offeringsRes.json();

            setCourses(coursesData.courses || []);
            setInstructors(instructorsData.instructors || []);
            setSessions(offeringsData.sessions || []);

            // Set default session to current
            const current = offeringsData.sessions?.find((s: Session) => s.isCurrent);
            if (current) {
                setFormData(prev => ({ ...prev, academicSessionId: current.id }));
            }
        } catch (err) {
            console.error('Error fetching form data:', err);
            setError('Failed to load required data. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.courseId || !formData.academicSessionId) {
            setError('Please select both a course and a session.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            const response = await fetch('/api/admin/offerings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create offering');
            }

            router.push('/admin/offerings');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/offerings"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Float New Offering</h1>
                    <p className="text-sm text-slate-600">Create a new course offering for a specific semester</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
                    {/* Course Selection */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Select Course*</label>
                        <select
                            required
                            value={formData.courseId}
                            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Select a course...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Session Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Academic Session*</label>
                        <select
                            required
                            value={formData.academicSessionId}
                            onChange={(e) => setFormData({ ...formData, academicSessionId: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Select a session...</option>
                            {sessions.map(session => (
                                <option key={session.id} value={session.id}>
                                    {session.code} {session.isCurrent ? '(Current)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Instructor Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Primary Instructor</label>
                        <select
                            value={formData.instructorId}
                            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="">Assign later...</option>
                            {instructors.map(instructor => (
                                <option key={instructor.id} value={instructor.id}>
                                    {instructor.user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Student Capacity</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Slot */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Time Slot (e.g. A1, B2)</label>
                        <input
                            type="text"
                            placeholder="Enter slot code"
                            value={formData.slot}
                            onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Initial Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="ENROLLING">Enrolling</option>
                            <option value="RUNNING">Running</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex gap-3">
                        <Info className="h-5 w-5 shrink-0 text-blue-600" />
                        <p className="text-xs leading-relaxed text-blue-700">
                            Floating an offering makes it visible to students for registration during the "Enrolling" phase.
                            The unique combination of Course and Academic Session ensures no duplicates are created.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Link
                        href="/admin/offerings"
                        className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Float Offering
                    </button>
                </div>
            </form>
        </div>
    );
}
