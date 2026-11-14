import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { StockOverviewRow } from "@/lib/actions/stock.actions";
import CityBars from "./CityBars";
import Swatch from "./Swatch";

interface Props {
  product: StockOverviewRow;
  cityIndex: number;
}

const qtyColor = {
  ok: "text-fg",
  low: "text-low",
  out: "text-out",
};

const statusLabel = {
  ok: "IN STOCK",
  low: "LOW",
  out: "OUT",
};

const ProductRow = ({ product, cityIndex }: Props) => {
  const {
    _id,
    code,
    title,
    description,
    color,
    qty,
    total,
    threshold,
    status,
    cities,
  } = product;

  let sub = statusLabel[status];
  if (cities && cityIndex >= 0) sub = `OF ${total}`;
  else if (cities) {
    sub = `${cities.filter((n) => n > 0).length}/${cities.length} CITIES`;
  }

  return (
    <Link
      href={ROUTES.PRODUCT(_id)}
      className="flex items-center gap-3.5 border-b border-white/5 p-[18px] last:border-b-0 active:bg-white/[0.03]"
    >
      <Swatch color={color} className="size-11 rounded-[13px]" />

      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className="font-wide text-base font-extrabold tracking-tight">
          {code}
        </span>
        <span className="truncate text-xs text-fg-muted">
          {title} · {description}
        </span>
      </div>

      {cities && cities.length > 1 && (
        <CityBars values={cities} threshold={threshold} highlight={cityIndex} />
      )}

      <div className="flex min-w-16 shrink-0 flex-col items-end gap-1 text-right">
        <span
          className={cn(
            "font-wide text-xl font-extrabold tracking-tight tabular-nums",
            qtyColor[status]
          )}
        >
          {qty}
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.06em] text-fg-faint">
          {sub}
        </span>
      </div>
    </Link>
  );
};

export default ProductRow;
