import { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "@/generated/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      subscriptionPlan: string | null;
      isVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    subscriptionPlan: string | null;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    subscriptionPlan: string | null;
    isVerified: boolean;
  }
}
