import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import InstructorPortalClient from "./PortalClient";

export default async function InstructorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Validate session exists
  if (!session) {
    redirect("/login");
  }

  // Validate user has INSTRUCTOR role
  if (session.user.role !== "INSTRUCTOR") {
    const rolePortals: Record<string, string> = {
      STUDENT: "/student/dashboard",
      ADMIN: "/admin/dashboard",
    };
    
    const targetPortal = rolePortals[session.user.role];
    if (targetPortal) {
      redirect(targetPortal);
    } else {
      redirect("/login");
    }
  }

  return <InstructorPortalClient session={session}>{children}</InstructorPortalClient>;
}
