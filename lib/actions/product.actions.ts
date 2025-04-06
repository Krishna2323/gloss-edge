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
import ProductHistory, {
  ProductChanges,
} from "@/database/models/product-history.model";
import { isAdmin as isAdminUtil } from "../utils";
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Product as ProductInterface,
  ProductHistory as ProductHistoryType,
} from "@/types/global";

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

  const {
    productID,
    brand,
    categories,
    code,
    description,
    stock,
    title,
    remark,
  } = validationResult.params!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productID).populate("categories");

    if (!product) {
      throw new Error("Product not found");
    }

    const changes: ProductChanges = {};

    if (product.title !== title)
      changes.title = { old: product.title, new: title };
    if (product.description !== description)
      changes.description = { old: product.description, new: description };
    if (product.brand !== brand)
      changes.brand = { old: product.brand, new: brand };
    if (product.stock !== stock)
      changes.stock = { old: product.stock, new: stock };
    if (product.code !== code) changes.code = { old: product.code, new: code };

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
          { name: new RegExp(`^${category}$`, "i") },
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

    const userId = validationResult?.session?.user?.id;

    if (
      Object.keys(changes).length > 0 ||
      categoriesToAdd.length > 0 ||
      categoriesToRemove.length > 0
    ) {
      await ProductHistory.create(
        [
          {
            product: productID,
            editor: userId,
            changes,
            categoriesAdded: newCategoryDocuments.map((c) => c.category),
            categoriesRemoved: categoriesToRemove.map(
              (c: ICategoryDoc) => c._id
            ),
            remark,
          },
        ],
        { session }
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
): Promise<ActionResponse<ProductInterface>> {
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

export async function getProducts(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    products: ProductInterface[];
    isNext: boolean;
    totalProducts: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    isAdminAction: false,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);
  const filterQuery: FilterQuery<typeof Product> = {};

  if (filter === "recommended") {
    return {
      success: true,
      data: { products: [], isNext: false, totalProducts: 0 },
    };
  }

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { brand: { $regex: new RegExp(query, "i") } },
      { description: { $regex: new RegExp(query, "i") } },
      { code: { $regex: new RegExp(query, "i") } },
    ];
  }

  const isAdmin = isAdminUtil(validationResult.session?.user.role);

  let sortCriteria: Record<string, 1 | -1> = {
    ...(isAdmin ? { stock: 1 } : {}),
  };
  switch (filter) {
    case "newest":
      sortCriteria = { ...sortCriteria, createdAt: -1 };
      break;
    // case "unanswered":
    //   filterQuery.answers = 0;
    //   sortCriteria = { createdAt: -1 };
    //   break;
    case "popular":
      sortCriteria = { ...sortCriteria, upvotes: -1 };
      break;
    default:
      sortCriteria = { ...sortCriteria, createdAt: -1 };
      break;
  }

  try {
    const totalProducts = await Product.countDocuments(filterQuery);
    const products = await Product.find(filterQuery)
      .populate("categories", "name")
      // .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
    const isNext = totalProducts > skip + products.length;

    return {
      success: true,
      data: {
        products: JSON.parse(JSON.stringify(products)),
        isNext,
        totalProducts,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getProductsHistory(): Promise<
  ActionResponse<{ productHistories: ProductHistoryType[] }>
> {
  const validationResult = await action({
    isAdminAction: true,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const productHistories = await ProductHistory.find()
      .sort({
        createdAt: -1,
      })
      .populate("categoriesAdded")
      .populate("product")
      .populate("categoriesRemoved")
      .limit(50);

    return {
      success: true,
      data: { productHistories: JSON.parse(JSON.stringify(productHistories)) },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
