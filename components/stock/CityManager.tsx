"use client";

import { ChevronRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CityRow,
  createCity,
  setCityActive,
  updateCity,
} from "@/lib/actions/location.actions";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-[52px] w-full rounded-2xl border border-white/[0.08] bg-[#0A0A0B] px-4 text-[15px] text-fg shadow-well outline-none placeholder:text-fg-faint focus:border-gold/40";

const labelClass =
  "text-xs font-semibold uppercase tracking-[0.08em] text-fg-muted";

const CityList = ({
  cities,
  onPick,
}: {
  cities: CityRow[];
  onPick: (c: CityRow) => void;
}) => (
  <ul className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
    {cities.map((c) => (
      <li key={c._id} className="border-b border-white/5 last:border-b-0">
        <button
          type="button"
          onClick={() => onPick(c)}
          className="flex w-full items-center gap-3.5 p-[18px] text-left active:bg-white/[0.03]"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <span
              className={cn(
                "font-wide truncate text-base font-extrabold",
                !c.active && "text-fg-faint"
              )}
            >
              {c.name}
            </span>
            <span className="truncate text-xs text-fg-muted">
              {[c.state, `${c.products} products`].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-right">
            <span className="font-wide text-xl font-extrabold tabular-nums">
              {c.units.toLocaleString("en-IN")}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-[10px] font-semibold tracking-[0.06em]",
                c.low ? "text-low" : "text-fg-faint"
              )}
            >
              {c.low ? `${c.low} LOW` : "UNITS"}
            </span>
          </div>
          <ChevronRight
            aria-hidden="true"
            className="size-4 shrink-0 text-fg-faint"
          />
        </button>
      </li>
    ))}
  </ul>
);

const CityManager = ({ cities }: { cities: CityRow[] }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CityRow | null>(null);
  const [name, setName] = useState("");
  const [state, setState] = useState("");

  const active = cities.filter((c) => c.active);
  const inactive = cities.filter((c) => !c.active);

  const openSheet = (city: CityRow | null) => {
    setEditing(city);
    setName(city?.name ?? "");
    setState(city?.state ?? "");
    setOpen(true);
  };

  const done = (message: string) => {
    toast.success(message);
    setOpen(false);
    router.refresh();
  };

  const save = () =>
    startTransition(async () => {
      const result = editing
        ? await updateCity({ locationID: editing._id, name, state })
        : await createCity({ name, state });
      if (!result.success) {
        const details = result.error?.details;
        toast.error(
          details?.name?.[0] ?? result.error?.message ?? "Could not save"
        );
        return;
      }
      done(editing ? `${name.trim()} updated` : `${name.trim()} added`);
    });

  const toggleActive = () =>
    startTransition(async () => {
      if (!editing) return;
      const result = await setCityActive({
        locationID: editing._id,
        active: !editing.active,
      });
      if (!result.success) {
        toast.error(result.error?.message ?? "Could not update city");
        return;
      }
      done(
        editing.active
          ? `${editing.name} deactivated`
          : `${editing.name} is active again`
      );
    });

  return (
    <>
      <div className="px-5 pt-7">
        <Button
          variant="gold"
          size="tap"
          className="w-full"
          onClick={() => openSheet(null)}
        >
          <Plus strokeWidth={2.8} />
          Add city
        </Button>
      </div>

      <h2 className="font-wide px-6 pb-3.5 pt-10 text-base font-black uppercase">
        Active
      </h2>
      {active.length > 0 ? (
        <CityList cities={active} onPick={openSheet} />
      ) : (
        <p className="mx-4 rounded-3xl border border-white/[0.06] bg-ink-900 p-6 text-center text-sm text-fg-muted">
          No active cities.
        </p>
      )}

      {inactive.length > 0 && (
        <>
          <h2 className="font-wide px-6 pb-3.5 pt-10 text-base font-black uppercase text-fg-faint">
            Inactive
          </h2>
          <CityList cities={inactive} onPick={openSheet} />
        </>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[92vh] flex-col gap-5 overflow-y-auto rounded-t-[28px] border-white/10 bg-gradient-to-b from-[#1A1A1D] to-[#0C0C0E] px-5 pb-8 pt-3 font-archivo text-fg"
        >
          <span className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-ink-600" />
          <div className="flex flex-col gap-1 pr-8">
            <SheetTitle className="font-wide text-[22px] font-black uppercase text-fg">
              {editing ? "Edit city" : "Add city"}
            </SheetTitle>
            <SheetDescription className="text-sm text-fg-muted">
              {editing
                ? `${editing.units.toLocaleString("en-IN")} units in ${editing.products} products`
                : "Stock can be moved here once it is added."}
            </SheetDescription>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="city-name" className={labelClass}>
                City name
              </label>
              <input
                id="city-name"
                value={name}
                maxLength={40}
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
                placeholder="Lucknow"
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="city-state" className={labelClass}>
                State (optional)
              </label>
              <input
                id="city-state"
                value={state}
                maxLength={40}
                autoComplete="off"
                onChange={(e) => setState(e.target.value)}
                placeholder="Uttar Pradesh"
                className={fieldClass}
              />
            </div>
            <Button
              type="submit"
              variant="gold"
              size="tap"
              disabled={pending || name.trim().length < 2}
            >
              {pending ? "Saving..." : editing ? "Save changes" : "Add city"}
            </Button>
          </form>

          {editing && (
            <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-5">
              <Button
                type="button"
                variant="raised"
                size="tap"
                disabled={pending || (editing.active && editing.units > 0)}
                onClick={toggleActive}
                className={cn(editing.active && "text-out")}
              >
                {editing.active ? "Deactivate city" : "Make active again"}
              </Button>
              {editing.active && editing.units > 0 && (
                <p className="text-center text-xs text-fg-faint">
                  Move or remove its {editing.units.toLocaleString("en-IN")}{" "}
                  units first.
                </p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CityManager;
