"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  FileText,
  ClipboardCheck,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  Menu,
  UserCog,
  Award,
  LogOut,
  Shield,
  Building2,
  Clock,
} from "lucide-react";

const navTabs: NavTab[] = [
  { name: "User Management", icon: Users, href: "/admin/users" },
  { name: "Departments", icon: Building2, href: "/admin/departments" },
  { name: "Academic Sessions", icon: Calendar, href: "/admin/sessions" },
  { name: "Course Catalog", icon: BookOpen, href: "/admin/courses" },
  { name: "Course Offerings", icon: GraduationCap, href: "/admin/offerings" },
  { name: "Scheduling", icon: Clock, href: "/admin/schedule" },
  { name: "Batch Advisors", icon: UserCog, href: "/admin/advisors" },
];

type NavTab = {
  name: string;
  icon: LucideIcon;
  href: string;
};

type PortalClientProps = {
  children: React.ReactNode;
  session: Session;
};

export default function AdminPortalClient({ children, session }: PortalClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        tabs={navTabs}
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
  return (
    <nav
      className={`fixed left-0 top-0 bottom-0 z-50 h-full border-r border-indigo-800 bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-700 shadow-lg transition-all duration-300 ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex h-20 items-center border-b border-white/30 px-4">
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 rounded-xl text-indigo-100 transition hover:bg-indigo-800 hover:text-white ${collapsed
              ? "mx-auto h-12 w-12 justify-center"
              : "w-full justify-start px-4 py-3"
            }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">AIMS++</h1>
              <span className="text-[0.65rem] font-bold text-indigo-200 uppercase tracking-wider mt-0.5">Admin Portal</span>
            </div>
          )}
        </button>
      </div>

      <ul className="mt-6 space-y-1.5 overflow-y-auto px-4 pb-20 [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:bg-transparent" style={{ maxHeight: "calc(100vh - 180px)" }}>
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.name}>
              <Link
                href={tab.href}
                className={`group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${collapsed
                    ? "mx-auto h-12 w-12 justify-center"
                    : "w-full justify-start px-4 py-2.5"
                  } ${isActive
                    ? "bg-white text-indigo-900"
                    : "text-indigo-100 hover:bg-indigo-800 hover:text-white"
                  }`}
                title={collapsed ? tab.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-700" : "text-indigo-200 group-hover:text-white"
                    }`}
                />
                {!collapsed && <span className="tracking-tight">{tab.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/30 bg-indigo-700 p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`group flex items-center justify-center gap-3 rounded-lg border border-indigo-400/30 text-sm font-medium text-indigo-100 transition-colors hover:border-red-400 hover:bg-red-600 hover:text-white ${collapsed
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
