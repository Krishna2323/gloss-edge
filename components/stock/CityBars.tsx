import { cn } from "@/lib/utils";

interface Props {
  values: number[];
  threshold: number;
  highlight?: number;
}

const CityBars = ({ values, threshold, highlight = -1 }: Props) => {
  const max = Math.max(1, ...values);
  const dense = values.length > 12;

  return (
    <div
      aria-hidden="true"
      className={cn("flex h-6 shrink-0 items-end", dense ? "gap-px" : "gap-0.5")}
    >
      {values.map((n, i) => (
        <span
          key={i}
          className={cn(
            "rounded-sm",
            dense ? "w-0.5" : "w-[3px]",
            i === highlight
              ? "bg-gold"
              : n === 0
                ? "bg-ink-700"
                : n < threshold
                  ? "bg-low"
                  : "bg-[#6B6B70]"
          )}
          style={{ height: `${Math.max(2, Math.round((n / max) * 24))}px` }}
        />
      ))}
    </div>
  );
};

export default CityBars;
