import { Minus, Plus } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const fieldClass =
  "h-[52px] w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0B] px-4 text-[15px] text-fg shadow-well outline-none focus:border-gold/40";

export const Label = ({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted"
  >
    {children}
  </label>
);

export const QtyStepper = ({
  id = "qty",
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const n = Number(value) || 0;

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="raised"
        size="tap-icon"
        className="size-14 shrink-0"
        aria-label="Decrease quantity"
        onClick={() => onChange(String(Math.max(0, n - 1)))}
      >
        <Minus />
      </Button>
      <label htmlFor={id} className="sr-only">
        Quantity
      </label>
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        className={cn(
          fieldClass,
          "font-wide h-14 text-center text-[28px] font-extrabold tabular-nums"
        )}
      />
      <Button
        type="button"
        variant="raised"
        size="tap-icon"
        className="size-14 shrink-0"
        aria-label="Increase quantity"
        onClick={() => onChange(String(n + 1))}
      >
        <Plus />
      </Button>
    </div>
  );
};
