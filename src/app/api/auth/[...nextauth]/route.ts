import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@/generated/prisma";

// Singleton pattern for Prisma Client to avoid multiple instances
const globalForPrisma = globalThis as unknown as {
  prismaAuth: PrismaClient | undefined;
};

const prismaAuth = globalForPrisma.prismaAuth ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAuth = prismaAuth;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaAuth),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000, // 10 seconds
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000, // 10 seconds
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",

    error: "/auth/login",
  },
  events: {
    async createUser({ user }) {
      console.log('=== CREATE USER EVENT ===');
      console.log('User data:', JSON.stringify(user, null, 2));

      try {
        // Mark OAuth users as verified automatically
        const updated = await prismaAuth.user.update({
          where: { id: parseInt(user.id) },
          data: { isVerified: true },
        });
        console.log('User updated:', JSON.stringify(updated, null, 2));
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGNIN CALLBACK ===');
      console.log('User:', JSON.stringify(user, null, 2));
      console.log('Account:', JSON.stringify(account, null, 2));
      console.log('Profile:', JSON.stringify(profile, null, 2));

      // Basic validation - just ensure user has an email
      if (!user.email) {
        console.log('❌ SIGNIN REJECTED: No email');
        return false;
      }

      console.log('✅ SIGNIN APPROVED');
      // Let PrismaAdapter handle user creation and account linking
      // For new users: adapter creates User + Account + Session
      // For existing users: adapter links new Account to existing User
      return true;
    },
    async session({ session, user }) {
      console.log('=== SESSION CALLBACK ===');
      console.log('Session input:', JSON.stringify(session, null, 2));
      console.log('User input:', JSON.stringify(user, null, 2));

      if (session.user) {
        session.user.id = user.id;

        try {
          // Fetch additional user data from database
          const dbUser = await prismaAuth.user.findUnique({
            where: { id: parseInt(user.id) },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              subscriptionPlan: true,
              isVerified: true,
            },
          });

          console.log('DB User:', JSON.stringify(dbUser, null, 2));

          if (dbUser) {
            session.user.role = dbUser.role;
            session.user.subscriptionPlan = dbUser.subscriptionPlan;
            // OAuth users are automatically verified
            session.user.isVerified = true;
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error);
        }
      }

      console.log('Session output:', JSON.stringify(session, null, 2));
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('=== JWT CALLBACK ===');
      console.log('Token:', JSON.stringify(token, null, 2));
      console.log('User:', JSON.stringify(user, null, 2));
      console.log('Account:', JSON.stringify(account, null, 2));

      if (user) {
        token.id = user.id;
      }

      console.log('Token output:', JSON.stringify(token, null, 2));
      return token;
    },
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
