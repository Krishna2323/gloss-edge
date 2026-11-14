# Restructure plan

Living checklist for the gloss-edge restructure. Production data lives in Atlas
(`clusterflex`, database `devflow`) and must never be lost.

## Phase 0: Safety (done)

- [x] Backup of production: `~/Backups/gloss-edge/devflow-2026-11-15.archive.gz`, counts verified
- [x] Local MongoDB replica set with a restored copy, `.env.local` points at it
- [x] Guard in `lib/mongoose.ts` that blocks Atlas outside production
- [x] Removed unauthenticated `/api/users`, `/api/accounts`, `/api/auth/signin-with-oauth`
- [x] Next.js 15.1.7 to 15.5.29 (Vercel blocked the vulnerable version)

## Phase 1: Decisions (in progress)

- [ ] Multi-city stock: answer open questions (see below)
- [ ] Pick the visual direction from the mockups
- [ ] Confirm the 5 admin accounts are expected

Decided (2026-11-15):

1. Only the admin changes city stock for now
2. One location per city, expect 10 to 20 cities, so no screen may assume two
3. Business customers do not see per-city stock
4. Mobile first, the admin uses a phone
5. Transfers between cities are needed
6. Low-stock warning is wanted
7. Visual direction approved: bold premium dark, dense lists with generous spacing,
   Archivo (wide for headings and numbers), one gold accent, per-city mini bar chart in rows

Still open:

- Name of the city that holds today's stock (the migration puts all current stock there)
- Name of the second city
- Employees: new `staff` role that sees per-city stock, or reuse `business`
- Low-stock threshold: one default for all products with a per-product override?

Mockups: https://claude.ai/artifact/9wEKqF9VWetkvrm7rynyia

## Phase 2: Multi-city stock

Proposed data model, following the Shopify inventory level pattern
(one quantity per product per location, totals are derived):

- `locations`: name, city, distributor contact, active flag
- `stocklevels`: product, location, quantity. Unique on (product, location)
- `stockmovements`: product, location, signed change, type
  (in, out, transfer, adjust), remark, user, time. Every stock change writes
  one row here and updates `stocklevels` in the same transaction

Migration (tested on the local copy first, fresh backup before running on prod):

1. Create one location for the city that holds today's stock
2. Copy each `products.stock` into `stocklevels` for that location
3. Keep `products.stock` untouched until the new screens are verified,
   then remove it in a later migration
4. Keep `producthistories` read-only as the history before the switch

## Phase 3: Redesign

- New theme and layout (drop the devflow look)
- Products data table with search, filters (city, brand, category, stock status)
- Stock adjust sheet (in, out, transfer) with remark
- Product detail page with per-city stock and movement history
- Dashboard: stock by city, out-of-stock and low-stock lists, recent movements
- Mobile layout for daily stock updates

## Deferred cleanup (do last)

- [ ] Drop `categoryproducts` (never read, 220 links missing, 5 dead rows)
- [ ] Replace `categories.products` counter with a live count (Acrylic and Louvers are wrong)
- [ ] Delete 3 accounts whose user no longer exists
- [ ] Fix ESLint config so `next lint` works (flat config vs ESLint 8)
- [ ] Remove devflow leftovers (`techMap.ts`, devicon helpers, `ASK_QUESTION`, upvote sort, `question` prop)
- [ ] Bugs: `isBusinessAccount` checks admin, `updateUserRole` toggles instead of setting,
      category add uses `includes`, "Showing N of M" count, unescaped regex in search,
      `ref: "Profuct"` typo
- [ ] Remove `NEXT_PUBLIC_API_BASE_URL` from Vercel
