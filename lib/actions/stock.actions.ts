"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AdjustStockSchema,
  GetProductSchema,
  StockOverviewSchema,
  TransferStockSchema,
} from "../validations";
import { applyStockChange, moveStockBetweenCities } from "../stock";
import { canSeeCityStock, escapeRegex, isAdmin } from "../utils";
import { ForbiddenError, NotFoundError } from "../http-errors";
import Location from "@/database/models/location.model";
import Product from "@/database/models/product.model";
import StockLevel from "@/database/models/stock-level.model";
import StockMovement from "@/database/models/stock-movement.model";
import { LOW_STOCK_DEFAULT, PRODUCTS_PER_PAGE } from "@/constants";
import { ActionResponse, ErrorResponse } from "@/types/global";

export type StockStatus = "ok" | "low" | "out";

export type StockOverviewRow = {
  _id: string;
  code: string;
  title: string;
  brand: string;
  description: string;
  color?: string;
  total: number;
  qty: number;
  threshold: number;
  status: StockStatus;
  cities?: number[];
};

export type StockOverview = {
  locations: { _id: string; name: string; units: number; low: number }[];
  products: StockOverviewRow[];
  counts: { units: number; low: number; out: number; products: number };
  isNext: boolean;
};

type StockOverviewParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: "" | "low" | "out";
  city?: string;
};

export async function getStockOverview(
  params: StockOverviewParams
): Promise<ActionResponse<StockOverview>> {
  const validationResult = await action({
    params,
    schema: StockOverviewSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    page = 1,
    pageSize = PRODUCTS_PER_PAGE,
    query,
    filter,
    city,
  } = validationResult.params!;
  const showCities = canSeeCityStock(validationResult.session?.user.role);
  const cityId = showCities && city ? new mongoose.Types.ObjectId(city) : null;

  const match: Record<string, unknown> = {};
  if (query) {
    const pattern = new RegExp(escapeRegex(query), "i");
    match.$or = [
      { code: pattern },
      { title: pattern },
      { brand: pattern },
      { description: pattern },
    ];
  }

  try {
    const [result] = await Product.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "stocklevels",
          localField: "_id",
          foreignField: "product",
          as: "levels",
          pipeline: [{ $project: { _id: 0, location: 1, quantity: 1 } }],
        },
      },
      {
        $addFields: {
          total: { $sum: "$levels.quantity" },
          threshold: { $ifNull: ["$lowStockAt", LOW_STOCK_DEFAULT] },
        },
      },
      {
        $addFields: {
          qty: cityId
            ? {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$levels",
                        cond: { $eq: ["$$this.location", cityId] },
                      },
                    },
                    in: "$$this.quantity",
                  },
                },
              }
            : "$total",
        },
      },
      {
        $addFields: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$qty", 0] }, then: "out" },
                { case: { $lt: ["$qty", "$threshold"] }, then: "low" },
              ],
              default: "ok",
            },
          },
        },
      },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: null,
                units: { $sum: "$qty" },
                products: { $sum: 1 },
                low: { $sum: { $cond: [{ $eq: ["$status", "low"] }, 1, 0] } },
                out: { $sum: { $cond: [{ $eq: ["$status", "out"] }, 1, 0] } },
              },
            },
          ],
          rows: [
            ...(filter ? [{ $match: { status: filter } }] : []),
            {
              $sort: showCities
                ? { qty: 1 as const, code: 1 as const }
                : { createdAt: -1 as const },
            },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize + 1 },
            {
              $project: {
                code: 1,
                title: 1,
                brand: 1,
                description: 1,
                color: 1,
                total: 1,
                qty: 1,
                threshold: 1,
                status: 1,
                ...(showCities ? { levels: 1 } : {}),
              },
            },
          ],
        },
      },
    ]);

    const locations = showCities ? await getCityStats() : [];
    const rows = result.rows as (StockOverviewRow & {
      levels?: { location: mongoose.Types.ObjectId; quantity: number }[];
    })[];

    const products = rows.slice(0, pageSize).map(({ levels, ...row }) => {
      if (!levels) return row;
      const byCity = new Map(
        levels.map((l) => [l.location.toString(), l.quantity])
      );
      return {
        ...row,
        cities: locations.map((l) => byCity.get(l._id) ?? 0),
      };
    });

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          locations,
          products,
          counts: result.counts[0] ?? { units: 0, low: 0, out: 0, products: 0 },
          isNext: rows.length > pageSize,
        })
      ),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

async function getCityStats() {
  const [locations, stats] = await Promise.all([
    Location.find({ active: true }).sort({ name: 1 }).lean<
      { _id: mongoose.Types.ObjectId; name: string }[]
    >(),
    StockLevel.aggregate<{
      _id: mongoose.Types.ObjectId;
      units: number;
      low: number;
    }>([
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "p",
          pipeline: [{ $project: { lowStockAt: 1 } }],
        },
      },
      {
        $group: {
          _id: "$location",
          units: { $sum: "$quantity" },
          low: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$quantity", 0] },
                    {
                      $lt: [
                        "$quantity",
                        {
                          $ifNull: [
                            { $first: "$p.lowStockAt" },
                            LOW_STOCK_DEFAULT,
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const byId = new Map(stats.map((s) => [s._id.toString(), s]));
  return locations.map((l) => ({
    _id: l._id.toString(),
    name: l.name,
    units: byId.get(l._id.toString())?.units ?? 0,
    low: byId.get(l._id.toString())?.low ?? 0,
  }));
}

export async function getLocations(): Promise<
  ActionResponse<{ _id: string; name: string; state?: string }[]>
> {
  const validationResult = await action({
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const locations = await Location.find({ active: true })
      .sort({ name: 1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(locations)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export type ProductMovement = {
  _id: string;
  type: "opening" | "in" | "out" | "transfer" | "correction";
  city?: string;
  from?: string;
  to?: string;
  change: number;
  reason?: string;
  note?: string;
  user?: string;
  at: string;
  product?: { _id: string; code: string };
};

export type ProductDetail = {
  product: {
    _id: string;
    code: string;
    title: string;
    brand: string;
    description: string;
    color?: string;
    categories: string[];
  };
  total: number;
  threshold: number;
  status: StockStatus;
  cities?: { _id: string; name: string; qty: number }[];
  movements?: ProductMovement[];
  canEdit: boolean;
};

type MovementDoc = {
  _id: mongoose.Types.ObjectId;
  type: ProductMovement["type"];
  change: number;
  reason?: string;
  note?: string;
  transferId?: mongoose.Types.ObjectId;
  location?: { name: string };
  user?: { name: string };
  product?: { _id: mongoose.Types.ObjectId; code: string };
  createdAt: Date;
};

export async function getProductDetail(
  params: GetProductParams
): Promise<ActionResponse<ProductDetail>> {
  const validationResult = await action({
    params,
    schema: GetProductSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID } = validationResult.params!;
  const role = validationResult.session?.user.role;
  const showCities = canSeeCityStock(role);

  try {
    const product = await Product.findById(productID)
      .populate("categories", "name")
      .lean<{
        _id: mongoose.Types.ObjectId;
        code: string;
        title: string;
        brand: string;
        description: string;
        color?: string;
        lowStockAt?: number;
        categories: { name: string }[];
      }>();
    if (!product) throw new NotFoundError("Product");

    const levels = await StockLevel.find({ product: productID }).lean<
      { location: mongoose.Types.ObjectId; quantity: number }[]
    >();
    const total = levels.reduce((sum, l) => sum + l.quantity, 0);
    const threshold = product.lowStockAt ?? LOW_STOCK_DEFAULT;
    const status: StockStatus =
      total === 0 ? "out" : total < threshold ? "low" : "ok";

    const detail: ProductDetail = {
      product: {
        _id: product._id.toString(),
        code: product.code,
        title: product.title,
        brand: product.brand,
        description: product.description,
        color: product.color,
        categories: product.categories.map((c) => c.name),
      },
      total,
      threshold,
      status,
      canEdit: isAdmin(role),
    };

    if (showCities) {
      const locations = await Location.find({ active: true }).lean<
        { _id: mongoose.Types.ObjectId; name: string }[]
      >();
      const byCity = new Map(
        levels.map((l) => [l.location.toString(), l.quantity])
      );
      detail.cities = locations
        .map((l) => ({
          _id: l._id.toString(),
          name: l.name,
          qty: byCity.get(l._id.toString()) ?? 0,
        }))
        .sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name));

      const docs = await StockMovement.find({ product: productID })
        .populate("location", "name")
        .populate("user", "name")
        .sort({ createdAt: -1, _id: -1 })
        .limit(40)
        .lean<MovementDoc[]>();
      detail.movements = groupTransfers(docs).slice(0, 15);
    }

    return { success: true, data: JSON.parse(JSON.stringify(detail)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getRecentMovements(): Promise<
  ActionResponse<ProductMovement[]>
> {
  const validationResult = await action({ authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    if (!canSeeCityStock(validationResult.session?.user.role)) {
      throw new ForbiddenError();
    }

    const docs = await StockMovement.find({ type: { $ne: "opening" } })
      .populate("product", "code")
      .populate("location", "name")
      .populate("user", "name")
      .sort({ createdAt: -1, _id: -1 })
      .limit(16)
      .lean<MovementDoc[]>();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(groupTransfers(docs).slice(0, 8))),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

function groupTransfers(docs: MovementDoc[]): ProductMovement[] {
  const result: ProductMovement[] = [];
  const transfers = new Map<string, ProductMovement>();

  for (const doc of docs) {
    const base = {
      _id: doc._id.toString(),
      type: doc.type,
      change: doc.change,
      reason: doc.reason,
      note: doc.note,
      user: doc.user?.name,
      at: new Date(doc.createdAt).toISOString(),
      product: doc.product?.code
        ? { _id: doc.product._id.toString(), code: doc.product.code }
        : undefined,
    };

    if (doc.type !== "transfer" || !doc.transferId) {
      result.push({ ...base, city: doc.location?.name });
      continue;
    }

    const key = doc.transferId.toString();
    let row = transfers.get(key);
    if (!row) {
      row = { ...base, change: Math.abs(doc.change) };
      transfers.set(key, row);
      result.push(row);
    }
    if (doc.change < 0) row.from = doc.location?.name;
    else row.to = doc.location?.name;
  }

  return result;
}

export async function adjustStock(
  params: AdjustStockParams
): Promise<ActionResponse<{ quantity: number }>> {
  const validationResult = await action({
    params,
    schema: AdjustStockSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID, locationID, type, change, reason, note } =
    validationResult.params!;
  const userId = validationResult.session!.user.id!;

  const session = await mongoose.startSession();
  try {
    let quantity = 0;
    await session.withTransaction(async () => {
      const level = await applyStockChange({
        productId: productID,
        locationId: locationID,
        change,
        type,
        userId,
        reason,
        note,
        session,
      });
      quantity = level.quantity;
    });

    return { success: true, data: { quantity } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function transferStock(
  params: TransferStockParams
): Promise<ActionResponse<{ from: number; to: number }>> {
  const validationResult = await action({
    params,
    schema: TransferStockSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { productID, fromLocationID, toLocationID, quantity, note } =
    validationResult.params!;
  const userId = validationResult.session!.user.id!;

  const session = await mongoose.startSession();
  try {
    let result = { from: 0, to: 0 };
    await session.withTransaction(async () => {
      const { from, to } = await moveStockBetweenCities({
        productId: productID,
        fromLocationId: fromLocationID,
        toLocationId: toLocationID,
        quantity,
        userId,
        note,
        session,
      });
      result = { from: from.quantity, to: to.quantity };
    });

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
