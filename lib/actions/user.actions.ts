"use server";

import { User } from "@/database";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { ForbiddenError, NotFoundError } from "../http-errors";
import { SetUserRoleSchema } from "../validations";
import { ActionResponse, ErrorResponse } from "@/types/global";

export type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isYou: boolean;
};

export async function getUsers(): Promise<ActionResponse<UserRow[]>> {
  const validationResult = await action({
    isAdminAction: true,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const myId = validationResult.session?.user.id;

  try {
    const users = await User.find(
      {},
      { name: 1, email: 1, role: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .lean<
        {
          _id: { toString(): string };
          name: string;
          email: string;
          role: string;
          createdAt: Date;
        }[]
      >();

    return {
      success: true,
      data: users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date(u.createdAt).toISOString(),
        isYou: u._id.toString() === myId,
      })),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function setUserRole(
  params: SetUserRoleParams
): Promise<ActionResponse<{ role: string }>> {
  const validationResult = await action({
    params,
    schema: SetUserRoleSchema,
    isAdminAction: true,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userID, role } = validationResult.params!;

  try {
    if (userID === validationResult.session?.user.id) {
      throw new ForbiddenError("You cannot change your own role.");
    }

    const updated = await User.findOneAndUpdate(
      { _id: userID, role: { $ne: "admin" } },
      { role },
      { new: true }
    ).lean<{ role: string }>();

    if (!updated) {
      const exists = await User.exists({ _id: userID });
      if (!exists) throw new NotFoundError("User");
      throw new ForbiddenError("Admin accounts cannot be changed here.");
    }

    return { success: true, data: { role: updated.role } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
