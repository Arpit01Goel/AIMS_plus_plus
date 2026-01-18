import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  switch (session.user.role) {
    case "STUDENT":
      redirect("/student/dashboard")
    case "INSTRUCTOR":
      redirect("/instructor/dashboard")
    case "ADVISOR":
      redirect("/advisor/dashboard")
    case "ADMIN":
      redirect("/admin/dashboard")
    default:
      redirect("/login")
  }
}
