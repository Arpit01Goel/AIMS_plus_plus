import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ShieldCheck } from "lucide-react";

export default async function AdminWelcomePage() {
  const session = await getServerSession(authOptions);
  
  // Get the full name
  const name = session?.user?.name || "Admin";

  return (
    <div className="flex items-center justify-center">
      <div className="text-center">

        {/* Welcome Message */}
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900" style={{ fontSize: '2rem', marginBottom: '3rem' }}>
          Welcome Back, {name}
        </h1>

        {/* Icon Widget */}
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-700 p-8 shadow-lg">
            <ShieldCheck className="h-20 w-20 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* AIMS++ Branding */}
        <h2 className="font-bold tracking-tighter text-indigo-800" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          AIMS++
        </h2>

        {/* Instructions */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-lg mx-auto">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Navigation</h3>
          <ul className="space-y-2 text-sm text-slate-600 text-left">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">User Management</strong> – Manage system users and roles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Departments</strong> – Manage department data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Academic Sessions</strong> – Manage semester sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Course Catalog</strong> – Manage course catalog</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Course Offerings</strong> – Manage semester course offerings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Scheduling</strong> – Manage weekly schedules and meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Batch Advisors</strong> – Assign and allow advisors</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
