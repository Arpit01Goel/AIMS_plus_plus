'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Department {
    id: string;
    code: string;
    name: string;
}

export default function AddInstructorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [departments, setDepartments] = useState<Department[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        title: '',
        officialEmail: '',
        departmentId: '',
    });

    // Fetch departments on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchingData(true);

                const response = await fetch('/api/admin/departments');

                if (!response.ok) {
                    throw new Error('Failed to fetch departments');
                }

                const data = await response.json();
                setDepartments(data.departments || []);
            } catch (err) {
                setError('Failed to load form data. Please refresh the page.');
                console.error('Error fetching data:', err);
            } finally {
                setFetchingData(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/admin/instructors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create instructor');
            }

            setSuccess('Instructor created successfully!');
            setTimeout(() => {
                router.push('/admin/users');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to create instructor');
        } finally {
            setLoading(false);
        }
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
                        <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
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

                            <div>
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
                                    Leave blank to use login email
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Initial Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Department Information */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Department Assignment</h2>
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
