import { Schema, models, model, Types, Document } from "mongoose";

export interface IStockLevel {
  product: Types.ObjectId;
  location: Types.ObjectId;
  quantity: number;
}

export interface IStockLevelDoc extends IStockLevel, Document {}
const StockLevelSchema = new Schema<IStockLevel>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

StockLevelSchema.index({ product: 1, location: 1 }, { unique: true });
StockLevelSchema.index({ location: 1 });

const StockLevel =
  models?.StockLevel || model<IStockLevel>("StockLevel", StockLevelSchema);

export default StockLevel;
