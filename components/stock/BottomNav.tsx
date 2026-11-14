"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, History, Home, MapPin, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  home: Home,
  stock: BarChart3,
  add: Plus,
  history: History,
  users: Users,
  cities: MapPin,
};

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof icons;
  primary?: boolean;
};

const BottomNav = ({ items }: { items: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-4 bottom-[22px] z-40 mx-auto flex h-[70px] max-w-md items-center justify-around rounded-[22px] border border-white/[0.08] bg-tile shadow-float"
    >
      {items.map(({ href, label, icon, primary }) => {
        const Icon = icons[icon];
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        if (primary) {
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex size-[52px] items-center justify-center rounded-[17px] bg-gold-btn text-gold-ink shadow-gold-glow"
            >
              <Icon aria-hidden="true" className="size-6" strokeWidth={2.8} />
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-12 items-center justify-center",
              active ? "text-fg" : "text-fg-faint"
            )}
          >
            <Icon aria-hidden="true" className="size-[22px]" />
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
