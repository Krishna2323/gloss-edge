import { model, models, Schema, Types, Document } from "mongoose";

export interface ICategoryProduct {
  category: Types.ObjectId;
  product: Types.ObjectId;
}

export interface ICategoryProductDoc extends ICategoryProduct, Document {}
const CategoryProductSchema = new Schema<ICategoryProduct>(
  {
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Profuct", required: true },
  },
  { timestamps: true }
);

const CategoryProduct =
  models?.CategoryProduct ||
  model<ICategoryProduct>("CategoryProduct", CategoryProductSchema);

export default CategoryProduct;
