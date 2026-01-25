'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Department {
    id: string;
    code: string;
    name: string;
    programs: Program[];
}

interface Program {
    id: string;
    code: string;
    name: string;
    level: string;
}

interface Advisor {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    department: {
        id: string;
        code: string;
        name: string;
    } | null;
    program: {
        id: string;
        code: string;
        name: string;
    } | null;
}

export default function AddStudentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [departments, setDepartments] = useState<Department[]>([]);
    const [advisors, setAdvisors] = useState<Advisor[]>([]);
    const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
    const [filteredAdvisors, setFilteredAdvisors] = useState<Advisor[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        entryNumber: '',
        batch: '',
        phone: '',
        address: '',
        departmentId: '',
        programId: '',
        advisorId: '',
    });

    // Fetch departments and advisors on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchingData(true);

                const [deptResponse, advisorResponse] = await Promise.all([
                    fetch('/api/admin/departments'),
                    fetch('/api/admin/advisors'),
                ]);

                if (!deptResponse.ok || !advisorResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const deptData = await deptResponse.json();
                const advisorData = await advisorResponse.json();

                setDepartments(deptData.departments || []);
                setAdvisors(advisorData.advisors || []);
            } catch (err) {
                setError('Failed to load form data. Please refresh the page.');
                console.error('Error fetching data:', err);
            } finally {
                setFetchingData(false);
            }
        };

        fetchData();
    }, []);

    // Filter programs when department changes
    useEffect(() => {
        if (formData.departmentId) {
            const dept = departments.find((d) => d.id === formData.departmentId);
            setFilteredPrograms(dept?.programs || []);

            // Filter advisors by department
            const deptAdvisors = advisors.filter(
                (a) => a.department?.id === formData.departmentId
            );
            setFilteredAdvisors(deptAdvisors);

            // Reset program and advisor if they don't match new department
            setFormData((prev) => ({
                ...prev,
                programId: '',
                advisorId: '',
            }));
        } else {
            setFilteredPrograms([]);
            setFilteredAdvisors([]);
        }
    }, [formData.departmentId, departments, advisors]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
            // Generate random 8-digit password
            const randomPassword = Math.random().toString(36).slice(2, 10);

            const response = await fetch('/api/admin/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, password: randomPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create student');
            }

            setSuccess('Student created successfully!');
            setTimeout(() => {
                router.push('/admin/users');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to create student');
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
                            Add New Student
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            Create a new student account with advisor assignment
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
                                    placeholder="e.g., Amit Verma"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="e.g., student@iitrpr.ac.in"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Entry Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="entryNumber"
                                    value={formData.entryNumber}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="e.g., 2023CSB1001"
                                />
                            </div>



                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Batch Year
                                </label>
                                <input
                                    type="number"
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    min="2000"
                                    max="2100"
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="e.g., 2023"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="e.g., +91-9876543210"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-slate-700">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="e.g., Hostel A, Room 101"
                            />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Academic Information</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
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

                            <div>
                                <label className="block text-sm font-semibold text-slate-700">
                                    Program
                                </label>
                                <select
                                    name="programId"
                                    value={formData.programId}
                                    onChange={handleChange}
                                    disabled={!formData.departmentId}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">Select Program</option>
                                    {filteredPrograms.map((program) => (
                                        <option key={program.id} value={program.id}>
                                            {program.code} - {program.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Advisor
                                </label>
                                <select
                                    name="advisorId"
                                    value={formData.advisorId}
                                    onChange={handleChange}
                                    disabled={!formData.departmentId}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">Select Advisor</option>
                                    {filteredAdvisors.map((advisor) => (
                                        <option key={advisor.id} value={advisor.id}>
                                            {advisor.user.name} ({advisor.user.email})
                                        </option>
                                    ))}
                                </select>
                                {formData.departmentId && filteredAdvisors.length === 0 && (
                                    <p className="mt-2 text-xs text-amber-600">
                                        No advisors available for this department
                                    </p>
                                )}
                            </div>
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
                                    Create Student
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
