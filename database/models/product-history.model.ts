import { Schema, model, models, Types, Document } from "mongoose";

interface ChangeDetail<T> {
  old: T;
  new: T;
}

export interface ProductChanges {
  title?: ChangeDetail<string>;
  description?: ChangeDetail<string>;
  brand?: ChangeDetail<string>;
  stock?: ChangeDetail<number>;
  code?: ChangeDetail<string>;
}

export interface IProductHistory {
  product: Types.ObjectId;
  editor: Types.ObjectId;
  changes: ProductChanges;
  categoriesAdded?: Types.ObjectId[];
  categoriesRemoved?: Types.ObjectId[];
  remark?: string;
  editedAt: Date;
  deletedTitle?: string;
  deletedStock?: number;
}

export interface IProductHistoryDoc extends IProductHistory, Document {}

const ProductHistorySchema = new Schema<IProductHistory>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    editor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    changes: { type: Map, of: Object, required: true }, // Ensures structured data
    categoriesAdded: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    categoriesRemoved: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    editedAt: { type: Date, default: Date.now },
    remark: { type: String },
    deletedTitle: { type: String },
    deletedStock: { type: Number },
  },
  { timestamps: true }
);

const ProductHistory =
  models?.ProductHistory ||
  model<IProductHistory>("ProductHistory", ProductHistorySchema);

export default ProductHistory;
