import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminPortalClient from "./PortalClient";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Validate session exists
  if (!session) {
    redirect("/login");
  }

  // Validate user has ADMIN role
  if (session.user.role !== "ADMIN") {
    const rolePortals: Record<string, string> = {
      STUDENT: "/student",
      INSTRUCTOR: "/instructor",
      ADVISOR: "/advisor",
    };
    
    const targetPortal = rolePortals[session.user.role];
    if (targetPortal) {
      redirect(targetPortal);
    } else {
      redirect("/login");
    }
  }

  return <AdminPortalClient session={session}>{children}</AdminPortalClient>;
}
