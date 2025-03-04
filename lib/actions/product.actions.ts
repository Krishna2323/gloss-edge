"use server";

import mongoose, { FilterQuery } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  EditProductSchema,
  GetProductSchema,
  PaginatedSearchParamsSchema,
  ProductSchema,
} from "../validations";
import Product, { IProductDoc } from "@/database/models/product.model";
import CategoryProduct from "@/database/models/category-product.model";
import Category, { ICategoryDoc } from "@/database/models/category.model";

export async function createProduct(
  params: CreateProductParams
): Promise<ActionResponse<IProductDoc>> {
  const validationResult = await action({
    params,
    schema: ProductSchema,
    authorize: true,
    isAdminAction: true,
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
): Promise<ActionResponse<IProductDoc>> {
  const validationResult = await action({
    params,
    schema: EditProductSchema,
    authorize: true,
    isAdminAction: true,
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
      (category) =>
        !product.categories.some((t: ICategoryDoc) =>
          t.name.toLowerCase().includes(category.toLowerCase())
        )
    );

    const categoriesToRemove = product.categories.filter(
      (category: ICategoryDoc) =>
        !categories.some((c) => c.toLowerCase() === category.name.toLowerCase())
    );

    const newCategoryDocuments = [];

    if (categoriesToAdd.length > 0) {
      for (const category of categoriesToAdd) {
        const existingCategory = await Category.findOneAndUpdate(
          { name: { $regex: `^${category}$`, options: "i" } },
          { $setOnInsert: { name: category }, $inc: { products: 1 } },
          { upsert: true, new: true, session }
        );

        if (existingCategory) {
          newCategoryDocuments.push({
            category: existingCategory._id,
            product: productID,
          });

          product.categories.push(existingCategory._id);
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
        (category: mongoose.Types.ObjectId) =>
          !categoryIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(category._id)
          )
      );
    }

    if (newCategoryDocuments.length > 0) {
      await CategoryProduct.insertMany(newCategoryDocuments, { session });
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

export async function getProducts(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ products: Product[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    isAdminAction: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);
  const filterQuery: FilterQuery<typeof Product> = {};

  if (filter === "recommended") {
    return { success: true, data: { products: [], isNext: false } };
  }

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { description: { $regex: new RegExp(query, "i") } },
      { code: { $regex: new RegExp(query, "i") } },
    ];
  }

  let sortCriteria = {};
  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    // case "unanswered":
    //   filterQuery.answers = 0;
    //   sortCriteria = { createdAt: -1 };
    //   break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Product.countDocuments(filterQuery);
    const products = await Product.find(filterQuery)
      .populate("categories", "name")
      // .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
    const isNext = totalQuestions > skip + products.length;

    return {
      success: true,
      data: { products: JSON.parse(JSON.stringify(products)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
