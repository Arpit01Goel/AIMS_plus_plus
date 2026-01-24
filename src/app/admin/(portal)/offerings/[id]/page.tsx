'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Users,
    Calendar,
    MapPin,
    User,
    Trash2,
    AlertTriangle,
    Loader2,
    CheckCircle2,
    Clock,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface OfferingDetails {
    id: string;
    capacity: number;
    slot: string | null;
    status: 'ENROLLING' | 'RUNNING' | 'COMPLETED';
    course: {
        code: string;
        title: string;
        credits: number;
        department: { name: string; code: string } | null;
    };
    academicSession: {
        code: string;
    };
    primaryInstructor: {
        user: { name: string | null; email: string };
    } | null;
    enrollments: Array<{
        id: string;
        status: string;
        grade: string | null;
        student: {
            userId: string;
            entryNumber: string;
            user: { name: string | null; email: string };
            department: { code: string } | null;
        };
    }>;
    _count: {
        enrollments: number;
    };
}

export default function OfferingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [offering, setOffering] = useState<OfferingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOffering();
    }, [id]);

    const fetchOffering = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/offerings/${id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch offering');
            setOffering(data.offering);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            setUpdating(true);
            const res = await fetch(`/api/admin/offerings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Update failed');
            await fetchOffering();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this offering? This cannot be undone.')) return;

        try {
            setDeleting(true);
            const res = await fetch(`/api/admin/offerings/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');

            router.push('/admin/offerings');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
    );

    if (error || !offering) return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-red-900">Error Loading Offering</h2>
            <p className="mt-2 text-red-700">{error || 'Offering not found'}</p>
            <Link href="/admin/offerings" className="mt-6 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Back to Offerings
            </Link>
        </div>
    );

    const enrollmentPercent = (offering._count.enrollments / offering.capacity) * 100;

    return (
        <div className="space-y-6">
            {/* Header & Quick Actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/offerings"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{offering.course.code}</h1>
                        <p className="text-sm font-medium text-slate-600">{offering.course.title}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${offering.status === 'ENROLLING' ? 'bg-green-100 text-green-800' :
                        offering.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                        }`}>
                        {offering.status}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={offering.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={updating}
                    >
                        <option value="ENROLLING">Set to Enrolling</option>
                        <option value="RUNNING">Set to Running</option>
                        <option value="COMPLETED">Set to Completed</option>
                    </select>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Course Info Card */}
                <div className="space-y-6 md:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Offering Details</h3>
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="font-semibold text-slate-900">{offering.academicSession.code}</p>
                                    <p className="text-xs text-slate-500">Academic Session</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="font-semibold text-slate-900">{offering.slot || 'Not Assigned'}</p>
                                    <p className="text-xs text-slate-500">Scheduling Slot</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <User className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="font-semibold text-slate-900">{offering.primaryInstructor?.user.name || 'No Instructor'}</p>
                                    <p className="text-xs text-slate-500">Primary Instructor</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-indigo-600 p-6 text-white shadow-lg">
                        <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Enrollment Status</h3>
                        <div className="mt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-bold">{offering._count.enrollments}</span>
                                <span className="text-sm opacity-80">of {offering.capacity} seats</span>
                            </div>
                            <div className="mt-4 h-2 w-full rounded-full bg-indigo-400/30">
                                <div
                                    className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                    style={{ width: `${Math.min(enrollmentPercent, 100)}%` }}
                                />
                            </div>
                            <p className="mt-4 text-xs opacity-80 leading-relaxed">
                                {offering.status === 'ENROLLING'
                                    ? 'Currently accepting student course registration requests.'
                                    : 'Enrollment phase is closed.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="md:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50 p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                    Enrolled Students
                                </h3>
                                <Link
                                    href={`/admin/enrollments?offering=${offering.id}`}
                                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                    Bulk Manage <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {offering.enrollments.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-sm text-slate-500 italic">No students enrolled yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Entry Number</th>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-6 py-4">Dept</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {offering.enrollments.map((enr) => (
                                            <tr key={enr.id} className="hover:bg-slate-50 transition">
                                                <td className="px-6 py-4 font-mono font-semibold text-slate-900">{enr.student.entryNumber}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{enr.student.user.name}</div>
                                                    <div className="text-xs text-slate-500">{enr.student.user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{enr.student.department?.code || '-'}</td>
                                                <td className="px-6 py-4">
                                                    {enr.status === 'ENROLLED' ? (
                                                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                            <CheckCircle2 className="h-4 w-4" /> Enrolled
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-orange-600 font-semibold">
                                                            <Clock className="h-4 w-4" /> {enr.status.replace(/_/g, ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="rounded bg-slate-100 px-2 py-1 font-bold text-slate-700">
                                                        {enr.grade || 'N/A'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
