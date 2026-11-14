import type { ProductMovement } from "@/lib/actions/stock.actions";
import { cn, formatWhen } from "@/lib/utils";

const title = (m: ProductMovement) => {
  switch (m.type) {
    case "transfer":
      return `${m.from ?? "?"} → ${m.to ?? "?"}`;
    case "opening":
      return `Opening · ${m.city}`;
    case "in":
      return `In · ${m.city}`;
    case "out":
      return `Out · ${m.city}`;
    default:
      return `Correction · ${m.city}`;
  }
};

const MovementList = ({ movements }: { movements: ProductMovement[] }) => {
  if (movements.length === 0) {
    return (
      <p className="mx-4 rounded-3xl border border-white/[0.06] bg-ink-900 p-6 text-center text-sm text-fg-muted">
        No movements yet.
      </p>
    );
  }

  return (
    <ul className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
      {movements.map((m) => {
        const detail = [m.reason, m.note, m.user, formatWhen(m.at)]
          .filter(Boolean)
          .join(" · ");
        const isTransfer = m.type === "transfer";

        return (
          <li
            key={m._id}
            className="flex items-center justify-between gap-3.5 border-b border-white/5 px-[18px] py-4 last:border-b-0"
          >
            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="truncate text-sm font-semibold">{title(m)}</span>
              <span className="truncate text-xs text-fg-muted">{detail}</span>
            </div>
            <span
              className={cn(
                "font-wide shrink-0 text-[17px] font-extrabold tabular-nums",
                isTransfer
                  ? "text-[#E5E5E5]"
                  : m.change < 0
                    ? "text-out"
                    : "text-gold"
              )}
            >
              {isTransfer || m.change < 0
                ? m.change.toString().replace("-", "−")
                : `+${m.change}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default MovementList;
