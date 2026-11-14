import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  chips: { label: string; href: string; active: boolean }[];
}

const FilterChips = ({ chips }: Props) => (
  <nav
    aria-label="Filter"
    className="flex gap-2.5 overflow-x-auto px-5 pt-[18px] [scrollbar-width:none]"
  >
    {chips.map(({ label, href, active }) => (
      <Link
        key={label}
        href={href}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex h-10 shrink-0 items-center rounded-full border px-[18px] text-[13px] font-bold",
          active
            ? "border-fg bg-fg text-ink-950"
            : "border-white/[0.12] text-[#D4D4D4]"
        )}
      >
        {label}
      </Link>
    ))}
  </nav>
);

export default FilterChips;
