// Moves every product's current stock into Gorakhpur as its opening balance.
// Dry run by default. Writes only with --apply. Safe to run again: products
// that already have a Gorakhpur stock level are skipped.
//
//   npx tsx --env-file=.env.local scripts/migrations/001-opening-stock-gorakhpur.ts
//   npx tsx --env-file=.env.local scripts/migrations/001-opening-stock-gorakhpur.ts --apply

import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Product from "@/database/models/product.model";
import Location from "@/database/models/location.model";
import StockLevel from "@/database/models/stock-level.model";
import StockMovement from "@/database/models/stock-movement.model";

const CITY = { name: "Gorakhpur", state: "Uttar Pradesh" };
const apply = process.argv.includes("--apply");

async function main() {
  const conn = await dbConnect();
  console.log(`Database: ${conn.connection.host}/${conn.connection.name}`);
  console.log(apply ? "Mode: APPLY" : "Mode: dry run (pass --apply to write)");

  const products = await Product.find({}, { stock: 1, creator: 1 }).lean<
    { _id: mongoose.Types.ObjectId; stock: number; creator: mongoose.Types.ObjectId }[]
  >();
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

  let city = await Location.findOne({ name: CITY.name });
  const existingLevels = city
    ? new Set(
        (await StockLevel.find({ location: city._id }, { product: 1 }).lean()).map(
          (l) => l.product.toString()
        )
      )
    : new Set<string>();
  const todo = products.filter((p) => !existingLevels.has(p._id.toString()));

  console.log(`Products: ${products.length}, units: ${totalUnits}`);
  console.log(`City ${CITY.name}: ${city ? "exists" : "will be created"}`);
  console.log(`Already migrated: ${existingLevels.size}, to migrate: ${todo.length}`);

  if (!apply || todo.length === 0) {
    await mongoose.disconnect();
    return;
  }

  await Location.createIndexes();
  await StockLevel.createIndexes();
  await StockMovement.createIndexes();
  if (!city) city = await Location.create(CITY);
  const cityId = city._id;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await StockLevel.insertMany(
        todo.map((p) => ({ product: p._id, location: cityId, quantity: p.stock })),
        { session }
      );
      await StockMovement.insertMany(
        todo
          .filter((p) => p.stock > 0)
          .map((p) => ({
            product: p._id,
            location: cityId,
            type: "opening",
            change: p.stock,
            balanceAfter: p.stock,
            note: "Opening stock before multi-city",
            user: p.creator,
          })),
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  const [check] = await StockLevel.aggregate([
    { $match: { location: cityId } },
    { $group: { _id: null, levels: { $sum: 1 }, units: { $sum: "$quantity" } } },
  ]);
  const ok = check?.levels === products.length && check?.units === totalUnits;
  console.log(
    `Verify: ${check?.levels} levels, ${check?.units} units in ${CITY.name}. ${ok ? "OK" : "MISMATCH"}`
  );

  await mongoose.disconnect();
  if (!ok) process.exit(1);
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
