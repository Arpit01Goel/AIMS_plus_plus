import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdvisorPortalClient from "./PortalClient";

export default async function AdvisorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Validate session exists
  if (!session) {
    redirect("/login");
  }

  // Validate user has ADVISOR role
  if (session.user.role !== "ADVISOR") {
    const rolePortals: Record<string, string> = {
      STUDENT: "/student",
      INSTRUCTOR: "/instructor/dashboard",
      ADMIN: "/admin/dashboard",
    };
    
    const targetPortal = rolePortals[session.user.role];
    if (targetPortal) {
      redirect(targetPortal);
    } else {
      redirect("/login");
    }
  }

  return <AdvisorPortalClient session={session}>{children}</AdvisorPortalClient>;
}
