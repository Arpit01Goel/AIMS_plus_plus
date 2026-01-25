import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import StudentPortalClient from "./PortalClient";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Validate session exists
  if (!session) {
    redirect("/login");
  }

  // Validate user has STUDENT role
  if (session.user.role !== "STUDENT") {
    // Redirect to appropriate portal based on their actual role
    const rolePortals: Record<string, string> = {
      INSTRUCTOR: "/instructor",
      ADVISOR: "/advisor",
      ADMIN: "/admin",
    };
    
    const targetPortal = rolePortals[session.user.role];
    if (targetPortal) {
      redirect(targetPortal);
    } else {
      redirect("/login");
    }
  }

  return <StudentPortalClient session={session}>{children}</StudentPortalClient>;
}
