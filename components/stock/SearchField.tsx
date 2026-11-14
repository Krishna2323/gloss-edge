"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SearchField = ({ placeholder }: { placeholder: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("query") ?? "");

  useEffect(() => {
    if (value === (searchParams.get("query") ?? "")) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("query", value);
      else params.delete("query");
      params.delete("page");
      router.replace(`${pathname}?${params}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, searchParams, pathname, router]);

  return (
    <div className="relative flex-1">
      <label htmlFor="stock-search" className="sr-only">
        {placeholder}
      </label>
      <Search
        aria-hidden="true"
        className="absolute left-4 top-1/2 size-[17px] -translate-y-1/2 text-fg-muted"
      />
      <input
        id="stock-search"
        type="search"
        inputMode="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-[54px] w-full rounded-[18px] border border-white/[0.06] bg-[#0F0F11] pl-11 pr-3.5 text-[15px] text-fg shadow-well outline-none placeholder:text-fg-faint focus:border-gold/40"
      />
    </div>
  );
};

export default SearchField;
