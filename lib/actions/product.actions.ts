"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  EditProductSchema,
  GetProductSchema,
  ProductSchema,
} from "../validations";
import Product from "@/database/models/product.model";
import CategoryProduct from "@/database/models/category-product.model";
import Category, { ICategoryDoc } from "@/database/models/category.model";

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

export async function editProduct(
  params: EditProductParams
): Promise<ActionResponse<Product>> {
  const validationResult = await action({
    params,
    schema: EditProductSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID, brand, categories, code, description, stock, title } =
    validationResult.params!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productID).populate("categories");

    if (!product) {
      throw new Error("Product not found");
    }

    if (
      product.title !== title ||
      product.description !== description ||
      product.brand !== brand ||
      product.stock !== stock ||
      product.code !== code
    ) {
      product.title = title;
      product.description = description;
      product.brand = brand;
      product.stock = stock;
      product.code = code;
      await product.save({ session });
    }

    const categoriesToAdd = categories.filter(
      (category) => !product.categories.includes(category.toLowerCase())
    );
    const categoriesToRemove = product.categories.filter(
      (category: ICategoryDoc) =>
        !categories.includes(category.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (categoriesToAdd.length > 0) {
      for (const category of categoriesToAdd) {
        const existingTag = await Category.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${category}$`, "i") } },
          { $setOnInsert: { name: category }, $inc: { products: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingTag) {
          newTagDocuments.push({
            category: existingTag._id,
            product: productID,
          });

          product.categories.push(existingTag._id);
        }
      }
    }

    if (categoriesToRemove.length > 0) {
      const categoryIdsToRemove = categoriesToRemove.map(
        (category: ICategoryDoc) => category._id
      );

      await Category.updateMany(
        { _id: { $in: categoryIdsToRemove } },
        { $inc: { products: -1 } },
        { session }
      );

      await CategoryProduct.deleteMany(
        { category: { $in: categoryIdsToRemove }, product: productID },
        { session }
      );

      product.categories = product.categories.filter(
        (categoryID: mongoose.Types.ObjectId) =>
          !categoriesToRemove.includes(categoryID)
      );
    }

    if (newTagDocuments.length > 0) {
      await CategoryProduct.insertMany(newTagDocuments, { session });
    }

    await product.save({ session });
    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getProduct(
  params: GetProductParams
): Promise<ActionResponse<Product>> {
  const validationResult = await action({
    params,
    schema: GetProductSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID } = validationResult.params!;

  try {
    const product = await Product.findById(productID).populate("categories");

    if (!product) {
      throw new Error("Product not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
