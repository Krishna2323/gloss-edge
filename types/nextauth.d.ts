import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role: string; // Add role to the session object
    };
  }

  interface User extends DefaultUser {
    role: string; // Ensure role exists in User type
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string; // Add role to the JWT token
  }
}
