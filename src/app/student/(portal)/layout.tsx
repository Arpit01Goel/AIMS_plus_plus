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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        tabs={navTabs}
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        pathname={pathname}
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
};

function Sidebar({ tabs, collapsed, onToggle, pathname }: SidebarProps) {
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

      <ul className="mt-6 space-y-1.5 px-4">
        {tabs.map((tab) => {
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
      </ul>
    </nav>
  );
}
