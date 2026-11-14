"use server";

import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { ForbiddenError, NotFoundError } from "../http-errors";
import {
  CreateCitySchema,
  SetCityActiveSchema,
  UpdateCitySchema,
} from "../validations";
import Location from "@/database/models/location.model";
import StockLevel from "@/database/models/stock-level.model";
import { LOW_STOCK_DEFAULT } from "@/constants";
import { ActionResponse, ErrorResponse } from "@/types/global";

export type CityRow = {
  _id: string;
  name: string;
  state?: string;
  active: boolean;
  units: number;
  products: number;
  low: number;
};

const caseInsensitive = { locale: "en", strength: 2 };

async function assertNameFree(name: string, exceptId?: string) {
  const clash = await Location.findOne({
    name,
    ...(exceptId && { _id: { $ne: exceptId } }),
  }).collation(caseInsensitive);

  if (clash) throw new ForbiddenError(`${clash.name} already exists`);
}

export async function listCities(): Promise<ActionResponse<CityRow[]>> {
  const validationResult = await action({
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const [locations, stats] = await Promise.all([
      Location.find()
        .sort({ name: 1 })
        .lean<
          {
            _id: mongoose.Types.ObjectId;
            name: string;
            state?: string;
            active: boolean;
          }[]
        >(),
      StockLevel.aggregate<{
        _id: mongoose.Types.ObjectId;
        units: number;
        products: number;
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
            products: { $sum: { $cond: [{ $gt: ["$quantity", 0] }, 1, 0] } },
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
    const cities = locations.map((l) => {
      const s = byId.get(l._id.toString());
      return {
        _id: l._id.toString(),
        name: l.name,
        state: l.state,
        active: l.active,
        units: s?.units ?? 0,
        products: s?.products ?? 0,
        low: s?.low ?? 0,
      };
    });

    return { success: true, data: cities };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createCity(
  params: CreateCityParams
): Promise<ActionResponse<{ _id: string }>> {
  const validationResult = await action({
    params,
    schema: CreateCitySchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { name, state } = CreateCitySchema.parse(validationResult.params);

  try {
    await assertNameFree(name);
    const city = await Location.create({ name, state: state || undefined });

    return { success: true, data: { _id: city._id.toString() } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateCity(
  params: UpdateCityParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateCitySchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { locationID, name, state } = UpdateCitySchema.parse(
    validationResult.params
  );

  try {
    await assertNameFree(name, locationID);
    const city = await Location.findByIdAndUpdate(locationID, {
      name,
      ...(state ? { state } : { $unset: { state: 1 } }),
    });
    if (!city) throw new NotFoundError("City");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function setCityActive(params: {
  locationID: string;
  active: boolean;
}): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: SetCityActiveSchema,
    authorize: true,
    isAdminAction: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { locationID, active } = validationResult.params!;

  try {
    if (!active) {
      const holding = await StockLevel.exists({
        location: locationID,
        quantity: { $gt: 0 },
      });
      if (holding) {
        throw new ForbiddenError(
          "This city still has stock. Move or remove it first."
        );
      }
    }

    const city = await Location.findByIdAndUpdate(locationID, { active });
    if (!city) throw new NotFoundError("City");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
