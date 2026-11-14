import { cn } from "@/lib/utils";

interface Props {
  tiles: { label: string; value: string | number; tone?: "low" | "out" }[];
}

const StatTiles = ({ tiles }: Props) => (
  <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 px-5 pt-7">
    {tiles.map(({ label, value, tone }) => (
      <div
        key={label}
        className="flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-white/[0.07] bg-tile p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <span
          className={cn(
            "font-wide text-[22px] font-extrabold tracking-tight tabular-nums",
            tone === "low" && "text-low",
            tone === "out" && "text-out"
          )}
        >
          {value}
        </span>
        <span className="text-[11px] font-semibold tracking-widest text-fg-muted">
          {label}
        </span>
      </div>
    ))}
  </div>
);

export default StatTiles;
