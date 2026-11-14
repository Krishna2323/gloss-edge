import Link from "next/link";
import { buildHref } from "@/lib/url";

interface Props {
  cities: { _id: string; name: string; units: number; low: number }[];
}

const CityOverview = ({ cities }: Props) => {
  const max = Math.max(1, ...cities.map((c) => c.units));
  const sorted = [...cities].sort(
    (a, b) => b.units - a.units || a.name.localeCompare(b.name)
  );

  return (
    <ul className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
      {sorted.map(({ _id, name, units, low }) => (
        <li key={_id} className="border-b border-white/5 last:border-b-0">
          <Link
            href={buildHref("/products", { city: _id })}
            className="flex flex-col gap-2.5 px-[18px] py-4 active:bg-white/[0.03]"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[15px] font-semibold">{name}</span>
              <span className="font-wide shrink-0 text-base font-extrabold tabular-nums">
                {units.toLocaleString("en-IN")}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1A1A1D]">
                <span
                  className="block h-1.5 rounded-full bg-gradient-to-r from-[#B8892C] to-gold"
                  style={{ width: `${Math.round((units / max) * 100)}%` }}
                />
              </span>
              <span className="min-w-16 whitespace-nowrap text-right text-[11px] font-bold tracking-[0.06em] text-low">
                {low ? `${low} LOW` : ""}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default CityOverview;
