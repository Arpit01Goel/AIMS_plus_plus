import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "STUDENT" | "INSTRUCTOR" | "ADVISOR" | "ADMIN"
    studentId?: string
    instructorId?: string
    advisorId?: string
    adminId?: string
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      role: "STUDENT" | "INSTRUCTOR" | "ADVISOR" | "ADMIN"
      studentId?: string
      instructorId?: string
      advisorId?: string
      adminId?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "STUDENT" | "INSTRUCTOR" | "ADVISOR" | "ADMIN"
    studentId?: string
    instructorId?: string
    advisorId?: string
    adminId?: string
  }
}
