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
      redirect("/student")
    case "INSTRUCTOR":
      redirect("/instructor")
    case "ADMIN":
      redirect("/admin")
    default:
      redirect("/login")
  }
}
