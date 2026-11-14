"use server";

import mongoose, { PipelineStage } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { HistorySchema } from "../validations";
import { escapeRegex } from "../utils";
import StockMovement from "@/database/models/stock-movement.model";
import type { ProductMovement } from "./stock.actions";
import { ActionResponse, ErrorResponse } from "@/types/global";

type HistoryParams = {
  page?: number;
  pageSize?: number;
  query?: string;
  kind?: "" | "in" | "out" | "move" | "edit";
  city?: string;
};

type HistoryDoc = {
  _id: mongoose.Types.ObjectId;
  source: "ledger" | "edit";
  type?: ProductMovement["type"];
  change?: number;
  reason?: string;
  note?: string;
  remark?: string;
  changes?: Record<string, { old: string | number; new: string | number }>;
  categoriesAdded?: unknown[];
  categoriesRemoved?: unknown[];
  deletedTitle?: string;
  at: Date;
  product?: { _id: mongoose.Types.ObjectId; code: string };
  user?: { name: string };
  here?: { name: string };
  other?: { name: string };
};

const TYPES = { in: "in", out: "out", move: "transfer" } as const;

const first = (field: string) => ({
  $addFields: { [field]: { $first: `$${field}` } },
});

const lookupOne = (
  from: string,
  localField: string,
  as: string,
  fields: Record<string, 1>
): PipelineStage[] => [
  {
    $lookup: {
      from,
      localField,
      foreignField: "_id",
      as,
      pipeline: [{ $project: fields }],
    },
  },
  first(as),
];

export async function getHistory(
  params: HistoryParams
): Promise<ActionResponse<{ entries: ProductMovement[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: HistorySchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    page = 1,
    pageSize = 30,
    query,
    kind,
    city,
  } = HistorySchema.parse(validationResult.params);
  const cityId = city ? new mongoose.Types.ObjectId(city) : null;

  const ledgerMatch: Record<string, unknown> = { type: { $ne: "opening" } };
  if (kind && kind !== "edit") ledgerMatch.type = TYPES[kind];
  if (cityId) ledgerMatch.location = cityId;
  else {
    ledgerMatch.$or = [{ type: { $ne: "transfer" } }, { change: { $lt: 0 } }];
  }

  const ledger: PipelineStage[] = [
    { $match: ledgerMatch },
    {
      $project: {
        source: { $literal: "ledger" },
        type: 1,
        change: 1,
        reason: 1,
        note: 1,
        product: 1,
        user: 1,
        location: 1,
        transferId: 1,
        at: "$createdAt",
      },
    },
  ];

  const edits = [
    {
      $project: {
        source: { $literal: "edit" },
        type: { $literal: "edit" },
        remark: 1,
        changes: 1,
        categoriesAdded: 1,
        categoriesRemoved: 1,
        deletedTitle: 1,
        product: 1,
        user: "$editor",
        at: "$createdAt",
      },
    },
  ];

  const includeLedger = kind !== "edit";
  const includeEdits = (!kind || kind === "edit") && !cityId;

  const pipeline: PipelineStage[] = includeLedger
    ? [...ledger]
    : [{ $match: { _id: null } }];
  if (includeEdits) {
    pipeline.push({
      $unionWith: { coll: "producthistories", pipeline: edits },
    } as PipelineStage);
  }

  const productLookup = lookupOne("products", "product", "productDoc", {
    code: 1,
    title: 1,
  });
  const paging: PipelineStage[] = [
    { $sort: { at: -1, _id: -1 } },
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize + 1 },
  ];

  if (query) {
    const pattern = new RegExp(escapeRegex(query), "i");
    pipeline.push(...productLookup, {
      $match: {
        $or: [
          { "productDoc.code": pattern },
          { "productDoc.title": pattern },
          { deletedTitle: pattern },
        ],
      },
    });
    pipeline.push(...paging);
  } else {
    pipeline.push(...paging, ...productLookup);
  }

  pipeline.push(
    ...lookupOne("users", "user", "user", { name: 1 }),
    ...lookupOne("locations", "location", "here", { name: 1 }),
    {
      $lookup: {
        from: "stockmovements",
        let: { t: "$transferId", id: "$_id" },
        as: "pair",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $ne: ["$$t", null] },
                  { $eq: ["$transferId", "$$t"] },
                  { $ne: ["$_id", "$$id"] },
                ],
              },
            },
          },
          { $project: { location: 1 } },
        ],
      },
    },
    first("pair"),
    ...lookupOne("locations", "pair.location", "other", { name: 1 }),
    { $addFields: { product: "$productDoc" } },
    { $project: { productDoc: 0, pair: 0, location: 0, transferId: 0 } }
  );

  try {
    const docs = await StockMovement.aggregate<HistoryDoc>(pipeline);
    const entries = docs.slice(0, pageSize).map(toEntry);

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({ entries, isNext: docs.length > pageSize })
      ),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

const FIELD_NAMES: Record<string, string> = {
  title: "title",
  description: "description",
  brand: "brand",
  code: "code",
};

function toEntry(doc: HistoryDoc): ProductMovement {
  const base = {
    _id: doc._id.toString(),
    user: doc.user?.name,
    at: new Date(doc.at).toISOString(),
    product: doc.product
      ? { _id: doc.product._id.toString(), code: doc.product.code }
      : { code: doc.deletedTitle ?? "Deleted product" },
  };

  if (doc.source === "ledger") {
    if (doc.type === "transfer") {
      const outgoing = (doc.change ?? 0) < 0;
      return {
        ...base,
        type: "transfer",
        change: Math.abs(doc.change ?? 0),
        from: outgoing ? doc.here?.name : doc.other?.name,
        to: outgoing ? doc.other?.name : doc.here?.name,
        note: doc.note,
      };
    }
    return {
      ...base,
      type: doc.type!,
      change: doc.change ?? 0,
      city: doc.here?.name,
      reason: doc.reason,
      note: doc.note,
    };
  }

  const changes = doc.changes ?? {};
  const stock = changes.stock;
  const fields = Object.keys(changes)
    .filter((k) => FIELD_NAMES[k])
    .map((k) => FIELD_NAMES[k]);
  if (doc.categoriesAdded?.length || doc.categoriesRemoved?.length) {
    fields.push("categories");
  }

  let summary = fields.length ? `Edited ${fields.join(", ")}` : "Edited";
  if (doc.deletedTitle) summary = "Deleted";
  else if (stock) {
    summary = `Stock ${stock.old} → ${stock.new}`;
    if (fields.length) summary += ` · ${fields.join(", ")}`;
  }

  return {
    ...base,
    type: "edit",
    change: stock ? Number(stock.new) - Number(stock.old) : 0,
    summary,
    note: doc.remark?.trim() || undefined,
  };
}
