"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { ProductSchema } from "../validations";
import Product from "@/database/models/product.model";
import CategoryProduct from "@/database/models/category-product.model";
import Category from "@/database/models/category.model";

export async function createProduct(
  params: CreateProductParams
): Promise<ActionResponse<Product>> {
  const validationResult = await action({
    params,
    schema: ProductSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, brand, categories, code, description, stock } =
    validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [product] = await Product.create(
      [{ title, description, brand, code, stock, creator: userId }],
      { session }
    );

    if (!product) {
      throw new Error("Failed to create product");
    }

    const categoryIds: mongoose.Types.ObjectId[] = [];
    const categoryProductDocuments = [];

    for (const category of categories) {
      const existingCategory = await Category.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${category}$`, "i") } },
        { $setOnInsert: { name: category }, $inc: { products: 1 } },
        { upsert: true, new: true, session }
      );

      categoryIds.push(existingCategory._id);
      categoryProductDocuments.push({
        category: existingCategory._id,
        product: product._id,
      });
    }

    await CategoryProduct.insertMany(categoryProductDocuments, { session });

    await Product.findByIdAndUpdate(
      product._id,
      { $push: { categories: { $each: categoryIds } } },
      { session }
    );

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
