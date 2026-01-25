import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
    studentId?: string
    instructorId?: string
    adminId?: string
    isAdvisor?: boolean
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
      studentId?: string
      instructorId?: string
      adminId?: string
      isAdvisor?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN"
    studentId?: string
    instructorId?: string
    adminId?: string
    isAdvisor?: boolean
  }
}
