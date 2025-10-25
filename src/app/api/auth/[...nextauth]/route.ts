import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// Load environment variables
require('dotenv').config({ path: '.env.local' });

export const authOptions = {
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
          const user = await User.findOne({ email: credentials?.email });

          if (user && credentials?.password && await verifyPassword(credentials.password, user.password)) {
            // Check if the user has an allowed role for admin access
            const allowedRoles = ['admin', 'editor', 'reviewer', 'finance'];
            if (!allowedRoles.includes(user.role)) {
              throw new Error("Access Denied: Insufficient role.");
            }
            return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
          } else {
            return null;
          }
        } catch (error) {
          console.error('NextAuth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Add role to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Add role to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login", // Custom sign-in page
    error: "/admin/login", // Error page
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };