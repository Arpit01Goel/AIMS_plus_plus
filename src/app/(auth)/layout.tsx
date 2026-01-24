import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to their portal
  if (session) {
    const rolePortals: Record<string, string> = {
      STUDENT: "/student",
      INSTRUCTOR: "/instructor/dashboard",
      ADVISOR: "/advisor/dashboard",
      ADMIN: "/admin/dashboard",
    };

    const targetPortal = rolePortals[session.user.role];
    if (targetPortal) {
      redirect(targetPortal);
    }
  }

  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  );
}
