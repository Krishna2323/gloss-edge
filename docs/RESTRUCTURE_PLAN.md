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

8. First city: Gorakhpur, Uttar Pradesh. All current stock moves there in the migration
9. New `staff` role sees per-city stock. `business` customers keep seeing totals only
10. Low stock: default 10, optional per-product override (`lowStockAt`)
11. Optional per-product `color` with a neutral default. No image upload

Mockups: https://claude.ai/artifact/9wEKqF9VWetkvrm7rynyia

## Phase 2: Multi-city stock

Proposed data model, following the Shopify inventory level pattern
(one quantity per product per location, totals are derived):

- `locations`: name, city, distributor contact, active flag
- `stocklevels`: product, location, quantity. Unique on (product, location)
- `stockmovements`: product, location, signed change, type
  (in, out, transfer, adjust), remark, user, time. Every stock change writes
  one row here and updates `stocklevels` in the same transaction

Progress:

- [x] Models: `locations`, `stocklevels`, `stockmovements`. Product gains optional `color`
      and `lowStockAt`. User role gains `staff`
- [x] `lib/stock.ts` (stock in, out, correction, transfer) and `lib/actions/stock.actions.ts`
- [x] Migration `scripts/migrations/001-opening-stock-gorakhpur.ts`, verified on the local copy
- [x] Tested locally: rejects overselling, rolls back on failure, ledger balances match,
      10 parallel removals never oversell
- [x] Screens stop editing `products.stock` directly. New products put their starting stock
      into a chosen city through `applyStockChange`
- [x] Role checks: `staff` sees inventory and per-city stock, `business` sees totals only.
      Stock changes stay admin only

Migration (tested on the local copy first, fresh backup before running on prod):

1. Create one location for the city that holds today's stock
2. Copy each `products.stock` into `stocklevels` for that location
3. Keep `products.stock` untouched until the new screens are verified,
   then remove it in a later migration
4. Keep `producthistories` read-only as the history before the switch

## Phase 3: Redesign

- [x] Foundation: Archivo, dark only, gold accent, tokens, raised and gold buttons,
      bottom nav by role, account sheet
- [x] Products screen: search, city picker, low and out filters, per-city bars, pagination.
      Checked at phone and desktop width, admin and business roles
- [x] Product detail screen: stock per city, movement history, Stock in, Out and Move sheets.
      Tested end to end in a browser on the local copy, for admin, staff and business
- [x] Cities screen at `/cities`: add, rename, deactivate (only when empty), reactivate.
      Names unique ignoring case. Cities in the admin nav, Users in the account sheet
- [x] Home dashboard: units, low and out tiles that open the filtered list, stock by city,
      running low list and latest movements. Business sees tiles only
- [x] Add and edit product at `/products/new` and `/products/[id]/edit` (old admin URLs redirect).
      Starting stock goes into a chosen city, edit never touches stock, optional colour and
      low stock limit. Delete only when the product has no stock
- [x] History at `/history` (old admin URL redirects): new stock changes and the old product
      edits in one timeline grouped by day, with search, city and type filters
- [x] Users at `/users` (old admin URL redirects): search, role filters, set access to
      No access, Business or Staff. Admins and your own account are locked.
      Role changes apply on the next page load (only admin roles stay cached in the login)
- Stock adjust sheet (in, out, transfer) with remark
- Product detail page with per-city stock and movement history
- Dashboard: stock by city, out-of-stock and low-stock lists, recent movements
- Mobile layout for daily stock updates

## Deferred cleanup (do last)

- [x] Stop writing `categoryproducts` and the `categories.products` counter. The product form
      counts categories live from products (Acrylic and Louvers counters were wrong)
- [x] `npm run lint` runs ESLint directly (`next lint` is deprecated and broke on the flat config)
- [x] Removed devflow leftovers: `techMap.ts`, devicon helpers, `ASK_QUESTION`, upvote sort,
      old cards, sidebar and navbar, the old admin layout, empty orders and profile pages
- [x] Dead bugs removed with their code: `isBusinessAccount`, the old `getProducts` search,
      "Showing N of M", `ref: "Profuct"`
- [x] Production data (backup `devflow-2026-11-15-precleanup.archive.gz`): dropped
      `categoryproducts`, unset `categories.products`, deleted 3 accounts whose user no longer existed
- [ ] Remove `NEXT_PUBLIC_API_BASE_URL` from Vercel
- [x] Sign in and sign up in the new design. Errors show as toasts again (the old toast hook had no container)
