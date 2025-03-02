import { Schema, models, model, Document } from "mongoose";

export interface ICategory {
  name: string;
  //   products: number;
}

export interface ICategoryDoc extends ICategory, Document {}
const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    // products: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category =
  models?.Category || model<ICategory>("Category", CategorySchema);

export default Category;
