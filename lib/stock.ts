import mongoose, { ClientSession, Types } from "mongoose";
import Location from "@/database/models/location.model";
import Product from "@/database/models/product.model";
import StockLevel, {
  IStockLevelDoc,
} from "@/database/models/stock-level.model";
import StockMovement, {
  StockMovementType,
} from "@/database/models/stock-movement.model";
import { InsufficientStockError, NotFoundError } from "./http-errors";

type StockChangeParams = {
  productId: string;
  locationId: string;
  change: number;
  type: StockMovementType;
  userId: string;
  reason?: string;
  note?: string;
  transferId?: Types.ObjectId;
  session: ClientSession;
};

export async function applyStockChange({
  productId,
  locationId,
  change,
  type,
  userId,
  reason,
  note,
  transferId,
  session,
}: StockChangeParams): Promise<IStockLevelDoc> {
  const product = await Product.exists({ _id: productId }).session(session);
  if (!product) throw new NotFoundError("Product");

  const location = await Location.exists({
    _id: locationId,
    active: true,
  }).session(session);
  if (!location) throw new NotFoundError("City");

  let level: IStockLevelDoc | null;

  if (change < 0) {
    // The quantity filter makes the check and the decrement one atomic step.
    level = await StockLevel.findOneAndUpdate(
      { product: productId, location: locationId, quantity: { $gte: -change } },
      { $inc: { quantity: change } },
      { new: true, session }
    );

    if (!level) {
      const current = await StockLevel.findOne({
        product: productId,
        location: locationId,
      }).session(session);
      throw new InsufficientStockError(current?.quantity ?? 0);
    }
  } else {
    level = await StockLevel.findOneAndUpdate(
      { product: productId, location: locationId },
      { $inc: { quantity: change } },
      { new: true, upsert: true, session }
    );
  }

  await StockMovement.create(
    [
      {
        product: productId,
        location: locationId,
        type,
        change,
        balanceAfter: level!.quantity,
        transferId,
        reason,
        note,
        user: userId,
      },
    ],
    { session }
  );

  // products.stock stays the total across cities, so totals and sorting need no aggregation.
  await Product.updateOne(
    { _id: productId },
    { $inc: { stock: change } },
    { session }
  );

  return level!;
}

export async function moveStockBetweenCities({
  productId,
  fromLocationId,
  toLocationId,
  quantity,
  userId,
  note,
  session,
}: {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  userId: string;
  note?: string;
  session: ClientSession;
}) {
  if (fromLocationId === toLocationId) {
    throw new Error("Pick two different cities");
  }

  const transferId = new mongoose.Types.ObjectId();
  const shared = {
    productId,
    type: "transfer" as const,
    userId,
    note,
    transferId,
    session,
  };

  const from = await applyStockChange({
    ...shared,
    locationId: fromLocationId,
    change: -quantity,
  });
  const to = await applyStockChange({
    ...shared,
    locationId: toLocationId,
    change: quantity,
  });

  return { from, to };
}
