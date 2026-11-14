import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credential from "next-auth/providers/credentials";
import mongoose from "mongoose";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import Account from "./database/models/account.model";
import User from "./database/models/user.model";
import dbConnect from "./lib/mongoose";
import { SignInSchema, SignInWithOAuthSchema } from "./lib/validations";
import { UserRole } from "./types/nextauth";

async function signInWithOAuth({
  user,
  provider,
  providerAccountId,
}: SignInWithOAuthParams): Promise<boolean> {
  const validatedData = SignInWithOAuthSchema.safeParse({
    provider,
    providerAccountId,
    user,
  });

  if (!validatedData.success) return false;

  await dbConnect();

  const { name, username, email, image } = user;
  const slugifiedUsername = slugify(username, {
    lower: true,
    strict: true,
    trim: true,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, username: slugifiedUsername, email, image }],
        { session }
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== name) updatedData.name = name;
      if (existingUser.image !== image) updatedData.image = image;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData }
        ).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    console.error("OAuth sign-in failed", error);
    return false;
  } finally {
    await session.endSession();
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credential({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          await dbConnect();

          const existingAccount = await Account.findOne({
            providerAccountId: email,
          });

          if (!existingAccount) return null;

          const existingUser = await User.findById(existingAccount.userId);

          if (!existingUser) return null;

          const isValidPassword = await bcrypt.compare(
            password,
            existingAccount.password!
          );

          if (isValidPassword) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
              role: existingUser.role as UserRole,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (
        (token?.role && token?.role === "admin") ||
        token?.role === "business"
      ) {
        session.user.id = token.sub!;
        session.user.role = token.role; // Ensure fresh role
        return session;
      }

      await dbConnect();
      const existingUser = await User.findById(token.sub);

      session.user.id = token.sub!;
      session.user.role = (existingUser?.role as UserRole) || token.role; // Ensure fresh role
      if (existingUser?.role) {
        token.role = existingUser?.role as UserRole;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.sub = user.id ?? token.sub;
        token.role = user.role;
        token.email = user.email;
      }
      if (account) {
        await dbConnect();

        const existingAccount = await Account.findOne({
          providerAccountId:
            account.type === "credentials"
              ? token.email!
              : account.providerAccountId,
        });

        if (!existingAccount) return token;

        const userId = existingAccount.userId;

        if (userId) token.sub = userId.toString();

        const existingUser = await User.findById(existingAccount.userId);

        if (existingUser) {
          token.role = existingUser.role; // Fetch role from DB
        }
      }

      return token;
    },
    async signIn({ user, account }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      return signInWithOAuth({
        user: {
          name: user.name!,
          email: user.email!,
          image: user.image!,
          username: user.name?.toLowerCase() as string,
        },
        provider: account.provider as "google",
        providerAccountId: account.providerAccountId,
      });
    },
  },
});
