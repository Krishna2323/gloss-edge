"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface City {
  _id: string;
  name: string;
  units: number;
  low: number;
}

interface Props {
  cities: City[];
  selectedId: string;
}

const CityPicker = ({ cities, selectedId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = cities.find((c) => c._id === selectedId);
  const allUnits = cities.reduce((sum, c) => sum + c.units, 0);
  const term = search.trim().toLowerCase();
  const rows = [
    { _id: "", name: "All cities", units: allUnits, low: 0 },
    ...cities,
  ].filter((c) => !term || c.name.toLowerCase().includes(term));

  const pick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("city", id);
    else params.delete("city");
    params.delete("page");
    setOpen(false);
    setSearch("");
    router.push(`${pathname}?${params}`, { scroll: false });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="flex h-[54px] shrink-0 items-center gap-1.5 rounded-[18px] border border-gold/35 bg-gold-chip px-4 text-sm font-bold text-gold shadow-[inset_0_1px_0_rgba(255,230,160,0.15),0_6px_14px_rgba(0,0,0,0.5)]">
        <MapPin aria-hidden="true" className="size-4" />
        <span className="max-w-24 truncate">{selected?.name ?? "All"}</span>
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="flex max-h-[82vh] flex-col gap-[18px] rounded-t-[28px] border-white/10 bg-gradient-to-b from-[#1A1A1D] to-[#0C0C0E] px-5 pb-6 pt-3 font-archivo text-fg"
      >
        <span className="mx-auto h-[5px] w-10 rounded-full bg-ink-600" />
        <div className="flex items-baseline justify-between pr-8">
          <SheetTitle className="font-wide text-[22px] font-black uppercase text-fg">
            City
          </SheetTitle>
          <SheetDescription className="text-xs font-semibold tracking-[0.08em] text-fg-muted">
            {cities.length} {cities.length === 1 ? "CITY" : "CITIES"}
          </SheetDescription>
        </div>

        {cities.length > 6 && (
          <>
            <label htmlFor="city-search" className="sr-only">
              Search city
            </label>
            <input
              id="city-search"
              type="search"
              placeholder="Search city"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[46px] rounded-[14px] border border-white/[0.06] bg-[#0A0A0B] px-3.5 text-[15px] text-fg shadow-well outline-none placeholder:text-fg-faint"
            />
          </>
        )}

        <div className="flex min-h-0 flex-col gap-1 overflow-y-auto">
          {rows.map((c) => (
            <button
              key={c._id || "all"}
              type="button"
              onClick={() => pick(c._id)}
              className={cn(
                "flex min-h-14 items-center gap-3.5 rounded-2xl px-4 text-left",
                c._id === selectedId
                  ? "bg-gold/[0.12] shadow-[inset_0_0_0_1px_rgba(245,196,81,0.45)]"
                  : "active:bg-white/5"
              )}
            >
              <span className="flex-1 text-base font-semibold">{c.name}</span>
              <span className="text-[13px] tabular-nums text-fg-muted">
                {c.units.toLocaleString("en-IN")} units
              </span>
              <span className="min-w-14 text-right text-xs font-bold text-low">
                {c.low ? `${c.low} low` : ""}
              </span>
            </button>
          ))}
          {rows.length === 0 && (
            <p className="py-6 text-center text-sm text-fg-muted">
              No city matches.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CityPicker;
