import Link from "next/link";
import { ROUTES } from "@/constants/routes";
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
    case "edit":
      return m.summary ?? "Edited";
    default:
      return `Correction · ${m.city}`;
  }
};

interface Props {
  movements: ProductMovement[];
  when?: (iso: string) => string;
}

const MovementList = ({ movements, when = formatWhen }: Props) => {
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
        const detail = [m.reason, m.note, m.user, when(m.at)]
          .filter(Boolean)
          .join(" · ");
        const isTransfer = m.type === "transfer";
        const productId = m.product?._id;

        const rowClass =
          "flex items-center justify-between gap-3.5 px-[18px] py-4";
        const content = (
          <>
            <div className="flex min-w-0 flex-col gap-[5px]">
              <span className="truncate text-sm font-semibold">
                {m.product && (
                  <span className="font-wide font-extrabold">
                    {m.product.code}{" "}
                  </span>
                )}
                {title(m)}
              </span>
              <span className="truncate text-xs text-fg-muted">{detail}</span>
            </div>
            {(m.type !== "edit" || m.change !== 0) && (
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
            )}
          </>
        );

        return (
          <li key={m._id} className="border-b border-white/5 last:border-b-0">
            {productId ? (
              <Link
                href={ROUTES.PRODUCT(productId)}
                className={cn(rowClass, "active:bg-white/[0.03]")}
              >
                {content}
              </Link>
            ) : (
              <div className={rowClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MovementList;
