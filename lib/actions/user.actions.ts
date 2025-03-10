"use server";

import { User } from "@/database";
import action from "../handlers/action";
import handleError from "../handlers/error";

export async function getUsers(): Promise<
  ActionResponse<{ users: User[]; totalUsers: number }>
> {
  const validationResult = await action({
    isAdminAction: true,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const totalUsers = await User.countDocuments();
    const users = await User.find().sort({ createdAt: -1 });

    return {
      success: true,
      data: { users: JSON.parse(JSON.stringify(users)), totalUsers },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateUserRole(
  userID: string,
  role: string
): Promise<ActionResponse> {
  const validationResult = await action({
    isAdminAction: true,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const updatedRole = role === "user" ? "business" : "user";
    await User.findByIdAndUpdate(userID, {
      role: updatedRole,
    });

    return {
      success: true,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
