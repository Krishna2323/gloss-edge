import { DefaultSession, DefaultUser } from "next-auth";

export type UserRole = "user" | "business" | "admin";
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: UserRole; // Add role to the session object
    };
  }

  interface User extends DefaultUser {
    role?: UserRole; // Ensure role exists in User type
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole; // Add role to the JWT token
  }
}
