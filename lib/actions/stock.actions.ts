"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AdjustStockSchema,
  GetProductSchema,
  TransferStockSchema,
} from "../validations";
import { applyStockChange, moveStockBetweenCities } from "../stock";
import Location from "@/database/models/location.model";
import StockLevel from "@/database/models/stock-level.model";
import StockMovement from "@/database/models/stock-movement.model";
import { ActionResponse, ErrorResponse } from "@/types/global";

export async function getLocations(): Promise<
  ActionResponse<{ _id: string; name: string; state?: string }[]>
> {
  const validationResult = await action({
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const locations = await Location.find({ active: true })
      .sort({ name: 1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(locations)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getProductStock(params: GetProductParams): Promise<
  ActionResponse<{
    levels: { location: { _id: string; name: string }; quantity: number }[];
    movements: unknown[];
  }>
> {
  const validationResult = await action({
    params,
    schema: GetProductSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID } = validationResult.params!;

  try {
    const levels = await StockLevel.find({ product: productID })
      .populate("location", "name state")
      .sort({ quantity: -1 })
      .lean();

    const movements = await StockMovement.find({ product: productID })
      .populate("location", "name")
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ levels, movements })),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function adjustStock(
  params: AdjustStockParams
): Promise<ActionResponse<{ quantity: number }>> {
  const validationResult = await action({
    params,
    schema: AdjustStockSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID, locationID, type, change, reason, note } =
    validationResult.params!;
  const userId = validationResult.session!.user.id!;

  const session = await mongoose.startSession();
  try {
    let quantity = 0;
    await session.withTransaction(async () => {
      const level = await applyStockChange({
        productId: productID,
        locationId: locationID,
        change,
        type,
        userId,
        reason,
        note,
        session,
      });
      quantity = level.quantity;
    });

    return { success: true, data: { quantity } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function transferStock(
  params: TransferStockParams
): Promise<ActionResponse<{ from: number; to: number }>> {
  const validationResult = await action({
    params,
    schema: TransferStockSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID, fromLocationID, toLocationID, quantity, note } =
    validationResult.params!;
  const userId = validationResult.session!.user.id!;

  const session = await mongoose.startSession();
  try {
    let result = { from: 0, to: 0 };
    await session.withTransaction(async () => {
      const { from, to } = await moveStockBetweenCities({
        productId: productID,
        fromLocationId: fromLocationID,
        toLocationId: toLocationID,
        quantity,
        userId,
        note,
        session,
      });
      result = { from: from.quantity, to: to.quantity };
    });

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
