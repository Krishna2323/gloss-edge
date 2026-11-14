import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import CityPicker from "@/components/stock/CityPicker";
import FilterChips from "@/components/stock/FilterChips";
import PageHeader from "@/components/stock/PageHeader";
import PageNav from "@/components/stock/PageNav";
import ProductRow from "@/components/stock/ProductRow";
import SearchField from "@/components/stock/SearchField";
import StatTiles from "@/components/stock/StatTiles";
import { PRODUCTS_PER_PAGE } from "@/constants";
import { getStockOverview } from "@/lib/actions/stock.actions";
import { buildHref } from "@/lib/url";
import { canSeeCityStock, canSeeInventory } from "@/lib/utils";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

const FILTERS = ["", "low", "out"] as const;

const ProductsPage = async ({ searchParams }: Props) => {
  const session = await auth();
  if (!canSeeInventory(session?.user.role)) {
    return <InfoText text="Only business accounts can see the inventory." />;
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filter = FILTERS.find((f) => f === params.filter) ?? "";
  const showCities = canSeeCityStock(session?.user.role);
  const city = showCities ? (params.city ?? "") : "";
  const query = params.query ?? "";

  const { success, data, error } = await getStockOverview({
    page,
    pageSize: PRODUCTS_PER_PAGE,
    query,
    filter,
    city,
  });

  const href = (changes: Record<string, string | number | undefined>) =>
    buildHref("/products", { query, filter, city, page, ...changes });

  const locations = data?.locations ?? [];
  const cityIndex = locations.findIndex((l) => l._id === city);
  const counts = data?.counts ?? { units: 0, low: 0, out: 0, products: 0 };
  const shown = filter ? counts[filter] : counts.products;

  return (
    <>
      <PageHeader title="Stock" />

      <StatTiles
        tiles={[
          { label: "UNITS", value: counts.units.toLocaleString("en-IN") },
          { label: "LOW", value: counts.low, tone: "low" as const },
          { label: "OUT", value: counts.out, tone: "out" as const },
        ]}
      />

      <div className="flex gap-2.5 px-5 pt-7">
        <SearchField placeholder="Code, name, brand" />
        {showCities && locations.length > 0 && (
          <CityPicker cities={locations} selectedId={city} />
        )}
      </div>

      <FilterChips
        chips={[
          { label: "All", href: href({ filter: "", page: 1 }), active: !filter },
          {
            label: "Low",
            href: href({ filter: "low", page: 1 }),
            active: filter === "low",
          },
          {
            label: "Out",
            href: href({ filter: "out", page: 1 }),
            active: filter === "out",
          },
        ]}
      />

      <div className="flex justify-between px-6 pb-3.5 pt-8 text-[11px] font-semibold tracking-widest text-fg-faint">
        <span>
          {shown} {shown === 1 ? "PRODUCT" : "PRODUCTS"}
        </span>
        <span>
          {cityIndex >= 0 ? locations[cityIndex].name.toUpperCase() : "TOTAL"}
        </span>
      </div>

      {!success ? (
        <p className="mx-4 rounded-3xl border border-out/30 bg-out/10 p-5 text-sm text-out">
          {error?.message ?? "Could not load stock."}
        </p>
      ) : data!.products.length === 0 ? (
        <p className="mx-4 rounded-3xl border border-white/[0.06] bg-ink-900 p-8 text-center text-sm text-fg-muted">
          {query || filter ? "No products match." : "No products yet."}
        </p>
      ) : (
        <div className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
          {data!.products.map((product) => (
            <ProductRow
              key={product._id}
              product={product}
              cityIndex={cityIndex}
            />
          ))}
        </div>
      )}

      <PageNav
        page={page}
        prevHref={page > 1 ? href({ page: page - 1 }) : undefined}
        nextHref={data?.isNext ? href({ page: page + 1 }) : undefined}
      />
    </>
  );
};

export default ProductsPage;
