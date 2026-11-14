import { cn } from "@/lib/utils";

interface Props {
  cities: { _id: string; name: string; qty: number }[];
  threshold: number;
}

const CityStockList = ({ cities, threshold }: Props) => {
  const max = Math.max(1, ...cities.map((c) => c.qty));

  return (
    <ul className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
      {cities.map(({ _id, name, qty }) => {
        const tone = qty === 0 ? "out" : qty < threshold ? "low" : "ok";

        return (
          <li
            key={_id}
            className="grid grid-cols-[104px_1fr_48px] items-center gap-3.5 border-b border-white/5 px-[18px] py-4 last:border-b-0"
          >
            <span
              className={cn(
                "truncate text-sm font-semibold",
                tone === "out" ? "text-fg-faint" : "text-[#E5E5E5]"
              )}
            >
              {name}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-[#1A1A1D]">
              <span
                className={cn(
                  "block h-2 rounded-full",
                  tone === "ok"
                    ? "bg-gradient-to-r from-[#B8892C] to-gold"
                    : "bg-low"
                )}
                style={{ width: `${Math.round((qty / max) * 100)}%` }}
              />
            </span>
            <span
              className={cn(
                "font-wide text-right text-base font-extrabold tabular-nums",
                tone === "out" && "text-out",
                tone === "low" && "text-low"
              )}
            >
              {qty === 0 ? "—" : qty}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default CityStockList;
