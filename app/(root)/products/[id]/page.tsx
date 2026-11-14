import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import InfoText from "@/components/auth/InfoText";
import CityStockList from "@/components/stock/CityStockList";
import MovementList from "@/components/stock/MovementList";
import SectionHeading from "@/components/stock/SectionHeading";
import StatTiles from "@/components/stock/StatTiles";
import StockActions from "@/components/stock/StockActions";
import { getProductDetail } from "@/lib/actions/stock.actions";
import { canSeeInventory, cn } from "@/lib/utils";
import { RouteParams } from "@/types/global";

const statusText = { ok: "IN STOCK", low: "LOW", out: "OUT OF STOCK" };

const ProductDetailPage = async ({ params }: RouteParams) => {
  const session = await auth();
  if (!canSeeInventory(session?.user.role)) {
    return <InfoText text="Only business accounts can see the inventory." />;
  }

  const { id } = await params;
  const { success, data } = await getProductDetail({ productID: id });
  if (!success || !data) notFound();

  const { product, total, threshold, status, cities, movements, canEdit } =
    data;
  const swatch = product.color ?? "#3A3A3F";

  return (
    <>
      <section
        className="-mt-7 flex h-[250px] flex-col justify-between px-5 pb-6 pt-[18px] sm:rounded-b-[32px]"
        style={{
          background: `linear-gradient(150deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.04) 36%, rgba(0,0,0,0) 55%, rgba(7,7,8,0.95) 100%), ${swatch}`,
        }}
      >
        <div className="flex justify-between">
          <Link
            href="/products"
            aria-label="Back to stock"
            className="flex size-11 items-center justify-center rounded-[14px] border border-white/15 bg-ink-950/50 text-white"
          >
            <ChevronLeft className="size-5" />
          </Link>
          {canEdit && (
            <Link
              href={`/products/${product._id}/edit`}
              className="flex h-11 items-center rounded-[14px] border border-white/15 bg-ink-950/50 px-4 text-sm font-bold text-white"
            >
              Edit
            </Link>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
              {[product.brand, ...product.categories].join(" · ")}
            </span>
            <h1 className="font-wide break-words text-[44px] font-black leading-[0.95] tracking-tight sm:text-[64px]">
              {product.code}
            </h1>
            <span className="truncate text-sm text-[#D4D4D4]">
              {product.title} · {product.description}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="font-wide text-[40px] font-black tabular-nums leading-none tracking-tight">
              {total}
            </span>
            <span className="text-[11px] font-bold tracking-widest text-fg-muted">
              UNITS
            </span>
          </div>
        </div>
      </section>

      {cities ? (
        <StatTiles
          tiles={[
            {
              label: "CITIES",
              value: `${cities.filter((c) => c.qty > 0).length}/${cities.length}`,
            },
            {
              label: "LOW",
              value: cities.filter((c) => c.qty > 0 && c.qty < threshold).length,
              tone: "low",
            },
            {
              label: "EMPTY",
              value: cities.filter((c) => c.qty === 0).length,
              tone: "out",
            },
          ]}
        />
      ) : (
        <p
          className={cn(
            "font-wide mx-5 mt-7 rounded-[20px] border border-white/[0.07] bg-tile p-5 text-lg font-extrabold",
            status === "low" && "text-low",
            status === "out" && "text-out"
          )}
        >
          {statusText[status]}
        </p>
      )}

      {canEdit && cities && (
        <StockActions
          productId={product._id}
          code={product.code}
          cities={cities}
        />
      )}

      {cities && (
        <>
          <SectionHeading>By city</SectionHeading>
          <CityStockList cities={cities} threshold={threshold} />
        </>
      )}

      {movements && (
        <>
          <SectionHeading>Latest</SectionHeading>
          <MovementList movements={movements} />
        </>
      )}
    </>
  );
};

export default ProductDetailPage;
