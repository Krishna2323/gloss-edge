"use client";

import { ArrowLeftRight, ArrowUpDown, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { adjustStock, transferStock } from "@/lib/actions/stock.actions";
import { cn } from "@/lib/utils";

type City = { _id: string; name: string; qty: number };

interface Props {
  productId: string;
  code: string;
  cities: City[];
}

const REASONS = {
  in: ["Received", "Returned", "Correction"],
  out: ["Sold", "Dispatched", "Damaged", "Correction"],
};

const fieldClass =
  "h-[52px] w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0B] px-4 text-[15px] text-fg shadow-well outline-none focus:border-gold/40";

const Label = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted"
  >
    {children}
  </label>
);

const CitySelect = ({
  id,
  cities,
  value,
  onChange,
}: {
  id: string;
  cities: City[];
  value: string;
  onChange: (id: string) => void;
}) => (
  <select
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(fieldClass, "appearance-none")}
  >
    {cities.map((c) => (
      <option key={c._id} value={c._id}>
        {c.name} · {c.qty} in stock
      </option>
    ))}
  </select>
);

const QtyStepper = ({
  value,
  onChange,
}: {
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
      <label htmlFor="qty" className="sr-only">
        Quantity
      </label>
      <input
        id="qty"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
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

const sheetClass =
  "flex max-h-[92vh] flex-col gap-5 overflow-y-auto rounded-t-[28px] border-white/10 bg-gradient-to-b from-[#1A1A1D] to-[#0C0C0E] px-5 pb-8 pt-3 font-archivo text-fg";

const Grabber = () => (
  <span className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-ink-600" />
);

const StockActions = ({ productId, code, cities }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sheet, setSheet] = useState<"in" | "out" | "move" | null>(null);

  const [mode, setMode] = useState<"in" | "out">("in");
  const [cityId, setCityId] = useState(cities[0]?._id ?? "");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const [fromId, setFromId] = useState(cities[0]?._id ?? "");
  const [toId, setToId] = useState(cities[1]?._id ?? "");

  const n = Number(qty) || 0;
  const city = cities.find((c) => c._id === cityId);
  const from = cities.find((c) => c._id === fromId);
  const to = cities.find((c) => c._id === toId);

  const open = (kind: "in" | "out" | "move") => {
    setQty("1");
    setNote("");
    if (kind === "move") {
      setFromId(cities[0]?._id ?? "");
      setToId(cities[1]?._id ?? "");
    } else {
      setMode(kind);
      setReason(REASONS[kind][0]);
    }
    setSheet(kind);
  };

  const switchMode = (next: "in" | "out") => {
    setMode(next);
    setReason(REASONS[next][0]);
  };

  const finish = (message: string) => {
    toast.success(message);
    setSheet(null);
    router.refresh();
  };

  const saveAdjustment = () =>
    startTransition(async () => {
      const result = await adjustStock({
        productID: productId,
        locationID: cityId,
        type: reason === "Correction" ? "correction" : mode,
        change: mode === "in" ? n : -n,
        reason,
        note: note.trim() || undefined,
      });
      if (result.success) {
        finish(`${code} · ${city?.name} now ${result.data?.quantity}`);
      } else {
        toast.error(result.error?.message ?? "Could not save");
      }
    });

  const saveTransfer = () =>
    startTransition(async () => {
      const result = await transferStock({
        productID: productId,
        fromLocationID: fromId,
        toLocationID: toId,
        quantity: n,
        note: note.trim() || undefined,
      });
      if (result.success) {
        finish(`Moved ${n} of ${code} to ${to?.name}`);
      } else {
        toast.error(result.error?.message ?? "Could not move stock");
      }
    });

  const tooMany = mode === "out" && !!city && n > city.qty;
  const after = city ? city.qty + (mode === "in" ? n : -n) : 0;
  const moveTooMany = !!from && n > from.qty;

  return (
    <>
      <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2.5 px-5 pt-7">
        <Button variant="gold" size="tap" onClick={() => open("in")}>
          <Plus strokeWidth={2.8} />
          Stock in
        </Button>
        <Button variant="raised" size="tap" onClick={() => open("out")}>
          <Minus />
          Out
        </Button>
        <Button
          variant="raised"
          size="tap"
          onClick={() => open("move")}
          disabled={cities.length < 2}
        >
          <ArrowLeftRight />
          Move
        </Button>
      </div>
      {cities.length < 2 && (
        <p className="px-6 pt-2.5 text-xs text-fg-faint">
          Moving stock needs at least two cities.
        </p>
      )}

      <Sheet
        open={sheet === "in" || sheet === "out"}
        onOpenChange={(o) => !o && setSheet(null)}
      >
        <SheetContent side="bottom" className={sheetClass}>
          <Grabber />
          <div className="flex flex-col gap-1 pr-8">
            <SheetTitle className="font-wide text-[22px] font-black uppercase text-fg">
              Update stock
            </SheetTitle>
            <SheetDescription className="text-sm text-fg-muted">
              {code}
            </SheetDescription>
          </div>

          <div
            role="group"
            aria-label="Direction"
            className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.06] bg-[#0A0A0B] p-1"
          >
            {(["in", "out"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => switchMode(m)}
                className={cn(
                  "h-12 rounded-xl text-[15px] font-bold",
                  mode === m
                    ? m === "in"
                      ? "bg-gold-btn text-gold-ink"
                      : "bg-raised text-fg shadow-raised"
                    : "text-fg-muted"
                )}
              >
                {m === "in" ? "+ Stock in" : "− Stock out"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <CitySelect
              id="city"
              cities={cities}
              value={cityId}
              onChange={setCityId}
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Quantity
            </span>
            <QtyStepper value={qty} onChange={setQty} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
              Reason
            </span>
            <div className="flex flex-wrap gap-2">
              {REASONS[mode].map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={reason === r}
                  onClick={() => setReason(r)}
                  className={cn(
                    "h-10 rounded-full border px-4 text-sm font-semibold",
                    reason === r
                      ? "border-gold/50 bg-gold/[0.12] text-gold"
                      : "border-white/[0.12] text-[#D4D4D4]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <input
              id="note"
              value={note}
              maxLength={200}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Customer, bill number..."
              className={cn(fieldClass, "placeholder:text-fg-faint")}
            />
          </div>

          {city && (
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-ink-900 px-4 py-3.5">
              <span className="text-sm text-fg-muted">{city.name} after save</span>
              <span className="font-wide text-lg font-extrabold tabular-nums">
                {city.qty} → <span className={cn(tooMany && "text-out")}>{after}</span>
              </span>
            </div>
          )}
          {tooMany && (
            <p role="alert" className="-mt-2 text-sm font-medium text-out">
              Only {city?.qty} in {city?.name}.
            </p>
          )}

          <Button
            variant={mode === "in" ? "gold" : "raised"}
            size="tap"
            disabled={pending || n === 0 || tooMany || !city}
            onClick={saveAdjustment}
          >
            {pending
              ? "Saving..."
              : `${mode === "in" ? "Add" : "Remove"} ${n} ${mode === "in" ? "to" : "from"} ${city?.name ?? ""}`}
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "move"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="bottom" className={sheetClass}>
          <Grabber />
          <div className="flex flex-col gap-1 pr-8">
            <SheetTitle className="font-wide text-[22px] font-black uppercase text-fg">
              Move stock
            </SheetTitle>
            <SheetDescription className="text-sm text-fg-muted">
              {code}
            </SheetDescription>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="from">From</Label>
            <CitySelect
              id="from"
              cities={cities}
              value={fromId}
              onChange={(id) => {
                setFromId(id);
                if (id === toId) setToId(fromId);
              }}
            />
          </div>

          <Button
            type="button"
            variant="raised"
            size="tap-icon"
            className="-my-2 self-center rounded-full"
            aria-label="Swap cities"
            onClick={() => {
              setFromId(toId);
              setToId(fromId);
            }}
          >
            <ArrowUpDown />
          </Button>

          <div className="flex flex-col gap-2">
            <Label htmlFor="to">To</Label>
            <CitySelect
              id="to"
              cities={cities}
              value={toId}
              onChange={(id) => {
                setToId(id);
                if (id === fromId) setFromId(toId);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted">
                Quantity
              </span>
              {from && from.qty > 0 && (
                <button
                  type="button"
                  onClick={() => setQty(String(from.qty))}
                  className="h-8 rounded-full border border-white/[0.12] px-3 text-xs font-bold text-[#D4D4D4]"
                >
                  All {from.qty}
                </button>
              )}
            </div>
            <QtyStepper value={qty} onChange={setQty} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="move-note">Note (optional)</Label>
            <input
              id="move-note"
              value={note}
              maxLength={200}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Truck number..."
              className={cn(fieldClass, "placeholder:text-fg-faint")}
            />
          </div>

          {from && to && (
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { c: from, after: from.qty - n, bad: moveTooMany },
                { c: to, after: to.qty + n, bad: false },
              ].map(({ c, after, bad }) => (
                <div
                  key={c._id}
                  className="flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-ink-900 px-4 py-3.5"
                >
                  <span className="truncate text-xs font-semibold text-fg-muted">
                    {c.name}
                  </span>
                  <span className="font-wide text-lg font-extrabold tabular-nums">
                    {c.qty} → <span className={cn(bad && "text-out")}>{after}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          {moveTooMany && (
            <p role="alert" className="-mt-2 text-sm font-medium text-out">
              Only {from?.qty} in {from?.name}.
            </p>
          )}

          <Button
            variant="gold"
            size="tap"
            disabled={pending || n === 0 || moveTooMany || !from || !to || fromId === toId}
            onClick={saveTransfer}
          >
            {pending ? "Moving..." : `Move ${n} to ${to?.name ?? ""}`}
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default StockActions;
