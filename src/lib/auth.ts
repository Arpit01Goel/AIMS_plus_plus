import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'iitrpr.ac.in';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          hd: ALLOWED_DOMAIN, // Restrict to specific domain
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        if (!credentials.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          throw new Error(`Only @${ALLOWED_DOMAIN} email addresses are allowed`);
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { student: true, instructor: true, advisor: true, admin: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          studentId: user.student?.id,
          instructorId: user.instructor?.id,
          advisorId: user.advisor?.id,
          adminId: user.admin?.id,
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Additional validation for Google OAuth
      if (account?.provider === 'google') {
        if (!user.email) {
          return false;
        }

        const email = user.email;

        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          return false;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!existingUser) {
          return false;
        }

      }
      return true;
    },

    async jwt({ token, user, account }) {
      // For credentials login, user object is already populated
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.studentId = user.studentId;
        token.instructorId = user.instructorId;
        token.advisorId = user.advisorId;
        token.adminId = user.adminId;
      }

      // For OAuth login (Google), fetch user from database
      if (account?.provider === 'google' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { student: true, instructor: true, advisor: true, admin: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.studentId = dbUser.student?.id;
          token.instructorId = dbUser.instructor?.id;
          token.advisorId = dbUser.advisor?.id;
          token.adminId = dbUser.admin?.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "STUDENT" | "INSTRUCTOR" | "ADVISOR" | "ADMIN";
        session.user.studentId = token.studentId as string | undefined;
        session.user.instructorId = token.instructorId as string | undefined;
        session.user.advisorId = token.advisorId as string | undefined;
        session.user.adminId = token.adminId as string | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
  },
};
