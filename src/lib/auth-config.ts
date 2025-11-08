import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

const allowedRoles = ['admin', 'editor', 'reviewer', 'finance'] as const;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectDB();
          const email = credentials?.email?.toLowerCase().trim();
          const password = credentials?.password;

          if (!email || !password) {
            return null;
          }

          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          if (!user.isActive) {
            throw new Error('AccountDisabled');
          }

          if (!allowedRoles.includes(user.role)) {
            throw new Error('AccessDenied');
          }

          const isValidPassword = await verifyPassword(password, user.password);

          if (!isValidPassword) {
            return null;
          }

          return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
        } catch (error) {
          console.error('NextAuth authorize error:', error);
          if (error instanceof Error) {
            throw error;
          }
          throw new Error('CredentialsSignin');
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await connectDB();
        if (user?.id) {
          await User.findByIdAndUpdate(user.id, { lastLogin: new Date() }).exec();
        }
      } catch (error) {
        console.error('Failed to record last login', error);
      }
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

