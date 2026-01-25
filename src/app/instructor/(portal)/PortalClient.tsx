"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  BookOpen,
  Users,
  FileText,
  ClipboardCheck,
  AlertCircle,
  User,
  LayoutDashboard,
  Menu,
  GraduationCap,
  CalendarDays,
  LogOut,
  UserCheck,
  Eye,
  ShieldAlert,
} from "lucide-react";

const instructorTabs: NavTab[] = [
  { name: "My Courses", icon: BookOpen, href: "/instructor/courses" },
  { name: "Create Course", icon: GraduationCap, href: "/instructor/create-course" },
  { name: "Grades", icon: FileText, href: "/instructor/grades" },
  { name: "Pending Actions", icon: AlertCircle, href: "/instructor/pending" },
];

const advisorTabs: NavTab[] = [
  { name: "My Students", icon: Users, href: "/instructor/advisor/students", section: "advisor" },
  { name: "Approvals", icon: ClipboardCheck, href: "/instructor/advisor-approvals", section: "advisor" },
];

type NavTab = {
  name: string;
  icon: LucideIcon;
  href: string;
  section?: string;
};

type PortalClientProps = {
  children: React.ReactNode;
  session: Session;
};

export default function InstructorPortalClient({ children, session }: PortalClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Combine instructor tabs with advisor tabs if user is an advisor
  const allTabs = session.user.isAdvisor 
    ? [...instructorTabs, ...advisorTabs]
    : instructorTabs;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        tabs={allTabs}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        pathname={pathname}
        session={session}
      />
      <main
        className="flex-1 bg-slate-50 transition-[margin] duration-300"
        style={{ marginLeft: collapsed ? "5rem" : "16rem" }}
      >
        <div className="mx-auto w-full max-w-7xl px-8 pb-20 pt-8">{children}</div>
      </main>
    </div>
  );
}

type SidebarProps = {
  tabs: NavTab[];
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
  session: Session;
};

function Sidebar({ tabs, collapsed, onToggle, pathname }: SidebarProps) {
  // Group tabs by section
  const instructorNavTabs = tabs.filter(tab => !tab.section);
  const advisorNavTabs = tabs.filter(tab => tab.section === 'advisor');
  const hasAdvisorSection = advisorNavTabs.length > 0;

  return (
    <nav
      className={`fixed left-0 top-0 bottom-0 h-full border-r border-indigo-800 bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-700 shadow-lg transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-20 items-center border-b border-white/30 px-4">
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 rounded-xl text-indigo-100 transition hover:bg-indigo-800 hover:text-white ${
            collapsed
              ? "mx-auto h-12 w-12 justify-center"
              : "w-full justify-start px-4 py-3"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5 shrink-0" />
          {!collapsed && <h1 className="text-xl font-bold tracking-tight text-white">AIMS++</h1>}
        </button>
      </div>

      <ul className="mt-6 space-y-1.5 overflow-y-auto px-4 pb-20 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {/* Instructor Section */}
        {!collapsed && <li className="mb-2 mt-2 px-4 text-xs font-semibold uppercase tracking-wider text-indigo-300">Instructor</li>}
        {instructorNavTabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.name}>
              <Link
                href={tab.href}
                className={`group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                  collapsed
                    ? "mx-auto h-12 w-12 justify-center"
                    : "w-full justify-start px-4 py-2.5"
                } ${
                  isActive
                    ? "bg-white text-indigo-900"
                    : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
                }`}
                title={collapsed ? tab.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-indigo-700" : "text-indigo-200 group-hover:text-white"
                  }`}
                />
                {!collapsed && <span className="tracking-tight">{tab.name}</span>}
              </Link>
            </li>
          );
        })}

        {/* Advisor Section */}
        {hasAdvisorSection && (
          <>
            {!collapsed && <li className="mb-2 mt-4 px-4 text-xs font-semibold uppercase tracking-wider text-indigo-300">Advisor</li>}
            {advisorNavTabs.map((tab) => {
              const isActive =
                pathname === tab.href || pathname.startsWith(`${tab.href}/`);
              const Icon = tab.icon;
              return (
                <li key={tab.name}>
                  <Link
                    href={tab.href}
                    className={`group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                      collapsed
                        ? "mx-auto h-12 w-12 justify-center"
                        : "w-full justify-start px-4 py-2.5"
                    } ${
                      isActive
                        ? "bg-white text-indigo-900"
                        : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
                    }`}
                    title={collapsed ? tab.name : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? "text-indigo-700" : "text-indigo-200 group-hover:text-white"
                      }`}
                    />
                    {!collapsed && <span className="tracking-tight">{tab.name}</span>}
                  </Link>
                </li>
              );
            })}
          </>
        )}
      </ul>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/30 bg-indigo-700 p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`group flex items-center justify-center gap-3 rounded-lg border border-indigo-400/30 text-sm font-medium text-indigo-100 transition-colors hover:border-red-400 hover:bg-red-600 hover:text-white ${
            collapsed
              ? "mx-auto h-12 w-12"
              : "mx-auto px-4 py-2.5"
          }`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0 text-indigo-200 group-hover:text-white" />
          {!collapsed && <span className="tracking-tight">Sign Out</span>}
        </button>
      </div>
    </nav>
  );
}
