"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateProductSchema,
  EditProductSchema,
  GetProductSchema,
} from "../validations";
import Product, { IProductDoc } from "@/database/models/product.model";
import Category, { ICategoryDoc } from "@/database/models/category.model";
import ProductHistory, {
  ProductChanges,
} from "@/database/models/product-history.model";
import Location from "@/database/models/location.model";
import StockLevel from "@/database/models/stock-level.model";
import { ForbiddenError, NotFoundError } from "../http-errors";
import { applyStockChange } from "../stock";
import { escapeRegex } from "../utils";
import {
  ActionResponse,
  ErrorResponse,
  Product as ProductInterface,
} from "@/types/global";

const uniqueNames = (names: string[]) =>
  names.filter(
    (name, i) =>
      names.findIndex((n) => n.toLowerCase() === name.toLowerCase()) === i
  );

export async function createProduct(
  params: CreateProductParams
): Promise<ActionResponse<{ _id: string }>> {
  const validationResult = await action({
    params,
    schema: CreateProductSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    title,
    brand,
    categories,
    code,
    description,
    color,
    lowStockAt,
    startingStock,
    locationID,
  } = CreateProductSchema.parse(validationResult.params);
  const userId = validationResult.session!.user.id!;

  const session = await mongoose.startSession();
  try {
    let productId = "";
    await session.withTransaction(async () => {
      const [product] = await Product.create(
        [
          {
            title,
            description,
            brand,
            code,
            color,
            lowStockAt,
            stock: 0,
            creator: userId,
          },
        ],
        { session }
      );

      for (const category of uniqueNames(categories)) {
        const existingCategory = await Category.findOneAndUpdate(
          { name: new RegExp(`^${escapeRegex(category)}$`, "i") },
          { $setOnInsert: { name: category } },
          { upsert: true, new: true, session }
        );
        product.categories.push(existingCategory._id);
      }

      await product.save({ session });

      if (startingStock > 0 && locationID) {
        await applyStockChange({
          productId: product._id.toString(),
          locationId: locationID,
          change: startingStock,
          type: "in",
          reason: "New product",
          userId,
          session,
        });
      }

      productId = product._id.toString();
    });

    return { success: true, data: { _id: productId } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
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
    title,
    remark,
    color,
    lowStockAt,
  } = EditProductSchema.parse(validationResult.params);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productID).populate("categories");

    if (!product) {
      throw new NotFoundError("Product");
    }

    const changes: ProductChanges = {};

    if (product.title !== title)
      changes.title = { old: product.title, new: title };
    if (product.description !== description)
      changes.description = { old: product.description, new: description };
    if (product.brand !== brand)
      changes.brand = { old: product.brand, new: brand };
    if (product.code !== code) changes.code = { old: product.code, new: code };

    if (
      product.title !== title ||
      product.description !== description ||
      product.brand !== brand ||
      product.code !== code
    ) {
      product.title = title;
      product.description = description;
      product.brand = brand;
      product.code = code;
      await product.save({ session });
    }
    product.color = color;
    product.lowStockAt = lowStockAt;
    const categoriesToAdd = uniqueNames(categories).filter(
      (category) =>
        !product.categories.some(
          (t: ICategoryDoc) => t.name.toLowerCase() === category.toLowerCase()
        )
    );

    const categoriesToRemove = product.categories.filter(
      (category: ICategoryDoc) =>
        !categories.some((c) => c.toLowerCase() === category.name.toLowerCase())
    );

    const addedCategoryIds: mongoose.Types.ObjectId[] = [];

    if (categoriesToAdd.length > 0) {
      for (const category of categoriesToAdd) {
        const existingCategory = await Category.findOneAndUpdate(
          { name: new RegExp(`^${escapeRegex(category)}$`, "i") },
          { $setOnInsert: { name: category } },
          { upsert: true, new: true, session }
        );

        if (existingCategory) {
          addedCategoryIds.push(existingCategory._id);
          product.categories.push(existingCategory._id);
        }
      }
    }

    if (categoriesToRemove.length > 0) {
      const categoryIdsToRemove = categoriesToRemove.map(
        (category: ICategoryDoc) => category._id
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
            categoriesAdded: addedCategoryIds,
            categoriesRemoved: categoriesToRemove.map(
              (c: ICategoryDoc) => c._id
            ),
            remark,
          },
        ],
        { session }
      );
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

export async function deleteProduct(params: {
  productID: string;
  remark?: string; // optional: add a reason for deletion to history
}): Promise<ActionResponse<null>> {
  const validationResult = await action({
    params,
    schema: GetProductSchema, // still validates productID
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID } = validationResult.params!;
  const remark = (params as { remark?: string })?.remark ?? "Product deleted";
  const editor = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Read under the same session for consistency
      const product = await Product.findById(productID)
        .select("categories title stock")
        .session(session);

      if (!product) {
        throw new NotFoundError("Product");
      }

      const stocked = await StockLevel.exists({
        product: productID,
        quantity: { $gt: 0 },
      }).session(session);
      if (stocked) {
        throw new ForbiddenError(
          "This product still has stock. Move or remove it first."
        );
      }
      await StockLevel.deleteMany({ product: productID }, { session });

      // Normalize category ids (handle possible mixed types)
      const categoryIdsRaw = (product.categories || []) as Array<
        mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId }
      >;

      const categoryIdStrings = Array.from(
        new Set(
          categoryIdsRaw.map((c) => {
            const id = (c as { _id: mongoose.Types.ObjectId })?._id ?? c;
            return id.toString();
          })
        )
      );

      const categoryIds = categoryIdStrings.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      // Delete the product itself
      await Product.findByIdAndDelete(productID, { session });

      // Log in history with snapshot fields for UI after deletion
      await ProductHistory.create(
        [
          {
            product: productID,
            editor,
            changes: {}, // nothing to diff on deletion; entry exists for audit trail
            categoriesAdded: [],
            categoriesRemoved: categoryIds,
            remark,
            deletedTitle: product.title,
            deletedStock: product.stock,
          },
        ],
        { session }
      );
    });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export type ProductFormOptions = {
  brands: string[];
  categories: string[];
  cities: { _id: string; name: string }[];
};

export async function getProductFormOptions(): Promise<
  ActionResponse<ProductFormOptions>
> {
  const validationResult = await action({
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const [brands, categories, cities] = await Promise.all([
      Product.distinct("brand") as Promise<string[]>,
      Product.aggregate<{ name: string }>([
        { $unwind: "$categories" },
        { $group: { _id: "$categories", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $project: { _id: 0, name: "$category.name" } },
      ]),
      Location.find({ active: true })
        .sort({ name: 1 })
        .lean<{ _id: mongoose.Types.ObjectId; name: string }[]>(),
    ]);

    return {
      success: true,
      data: {
        brands: uniqueNames(brands.map((b) => b.trim())).sort(),
        categories: categories.map((c) => c.name),
        cities: cities.map((c) => ({ _id: c._id.toString(), name: c.name })),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
