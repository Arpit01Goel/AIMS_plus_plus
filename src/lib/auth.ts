import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

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

        // Verify email domain
        if (!credentials.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          throw new Error(`Only @${ALLOWED_DOMAIN} email addresses are allowed`);
        }

        // TODO: Replace with your actual user authentication logic
        // This should query your database and verify password
        // Example:
        // const user = await db.user.findUnique({ where: { email: credentials.email } });
        // const isValid = await bcrypt.compare(credentials.password, user.password);
        
        // For now, this is a placeholder
        const user = {
          id: '1',
          email: credentials.email,
          name: credentials.email.split('@')[0],
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Additional validation for Google OAuth
      if (account?.provider === 'google') {
        const email = user.email || '';
        
        // Strict domain validation
        if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
          return false; // Reject sign-in
        }

        // Verify the hd (hosted domain) claim from Google
        if (profile && 'hd' in profile && profile.hd !== ALLOWED_DOMAIN) {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
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
