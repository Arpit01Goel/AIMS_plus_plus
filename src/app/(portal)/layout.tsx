"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  BookOpen,
  DollarSign,
  MessageSquare,
  User,
  FileText,
  Clock,
  Menu,
  LayoutDashboard,
} from "lucide-react";

const navTabs: NavTab[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Calender", icon: Calendar, href: "/calender" },
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "Fees", icon: DollarSign, href: "/fees" },
  { name: "Feedback", icon: MessageSquare, href: "/feedback" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Records", icon: FileText, href: "/records" },
  { name: "Timetable", icon: Clock, href: "/timetable" },
];

type NavTab = {
  name: string;
  icon: LucideIcon;
  href: string;
};

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Sidebar
        tabs={navTabs}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        pathname={pathname}
      />
      <main
        className="flex-1 transition-[margin] duration-300"
        style={{ marginLeft: collapsed ? "5rem" : "16rem" }}
      >
        <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">{children}</div>
      </main>
    </div>
  );
}

type SidebarProps = {
  tabs: NavTab[];
  collapsed: boolean;
  onToggle: () => void;
  pathname: string;
};

function Sidebar({ tabs, collapsed, onToggle, pathname }: SidebarProps) {
  return (
    <nav
      className={`fixed left-0 top-0 h-screen border-r border-white/10 bg-gradient-to-b from-indigo-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center border-b border-white/10 px-3">
        <button
          onClick={onToggle}
          className={`flex items-center gap-3 rounded-2xl text-slate-400 transition hover:bg-white/5 hover:text-white ${
            collapsed
              ? "mx-auto h-12 w-12 justify-center"
              : "w-full justify-start px-3 py-3"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5 shrink-0" />
          {!collapsed && <h1 className="text-lg font-bold text-white">AIMS++</h1>}
        </button>
      </div>

      <ul className="mt-4 space-y-1 px-3">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.name}>
              <Link
                href={tab.href}
                className={`group flex items-center gap-3 rounded-2xl text-sm font-medium transition ${
                  collapsed
                    ? "mx-auto h-12 w-12 justify-center"
                    : "w-full justify-start px-3 py-3"
                } ${
                  isActive
                    ? "bg-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                title={collapsed ? tab.name : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                {!collapsed && <span>{tab.name}</span>}
                {!collapsed && isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400"></span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
