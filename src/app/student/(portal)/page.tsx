import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GraduationCap } from "lucide-react";

export default async function StudentWelcomePage() {
  const session = await getServerSession(authOptions);
  
  // Get the full name
  const name = session?.user?.name || "Student";

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
            <GraduationCap className="h-20 w-20 text-white" strokeWidth={1.5} />
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
              <span><strong className="text-slate-900">Calendar</strong> – View academic calendar and events</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Courses</strong> – Enroll and manage your courses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Profile</strong> – Update your personal information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Records</strong> – Access your academic records</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-0.5">•</span>
              <span><strong className="text-slate-900">Timetable</strong> – Check your class schedule</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
