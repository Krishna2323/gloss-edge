import { Schema, models, model, Types, Document } from "mongoose";

export interface IProduct {
  brand: string;
  title: string;
  description: string;
  stock: number;
  categories: Types.ObjectId[];
  code: string;
  creator: Types.ObjectId;
  color?: string;
  lowStockAt?: number;
}

export interface IProductDoc extends IProduct, Document {}
const ProductSchema = new Schema<IProduct>(
  {
    brand: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    code: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    color: { type: String, match: /^#[0-9a-fA-F]{6}$/ },
    lowStockAt: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const Product = models?.Product || model<IProduct>("Product", ProductSchema);

export default Product;
