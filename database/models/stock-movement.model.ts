import { Schema, models, model, Types, Document } from "mongoose";

export const STOCK_MOVEMENT_TYPES = [
  "opening",
  "in",
  "out",
  "transfer",
  "correction",
] as const;

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export interface IStockMovement {
  product: Types.ObjectId;
  location: Types.ObjectId;
  type: StockMovementType;
  change: number;
  balanceAfter: number;
  transferId?: Types.ObjectId;
  reason?: string;
  note?: string;
  user: Types.ObjectId;
}

export interface IStockMovementDoc extends IStockMovement, Document {}
const StockMovementSchema = new Schema<IStockMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    type: { type: String, enum: STOCK_MOVEMENT_TYPES, required: true },
    change: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    // Both rows of one transfer share this id.
    transferId: { type: Schema.Types.ObjectId },
    reason: { type: String, trim: true },
    note: { type: String, trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

StockMovementSchema.index({ product: 1, createdAt: -1 });
StockMovementSchema.index({ location: 1, createdAt: -1 });

const StockMovement =
  models?.StockMovement ||
  model<IStockMovement>("StockMovement", StockMovementSchema);

export default StockMovement;
