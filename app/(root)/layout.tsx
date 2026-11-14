import { ReactNode } from "react";
import { auth } from "@/auth";
import BottomNav, { NavItem } from "@/components/stock/BottomNav";
import { canSeeInventory, isAdmin } from "@/lib/utils";

const navFor = (role?: string): NavItem[] => {
  if (isAdmin(role)) {
    return [
      { href: "/", label: "Home", icon: "home" },
      { href: "/products", label: "Stock", icon: "stock" },
      {
        href: "/admin/products/add",
        label: "Add product",
        icon: "add",
        primary: true,
      },
      { href: "/admin/products/history", label: "History", icon: "history" },
      { href: "/cities", label: "Cities", icon: "cities" },
    ];
  }
  if (canSeeInventory(role)) {
    return [
      { href: "/", label: "Home", icon: "home" },
      { href: "/products", label: "Stock", icon: "stock" },
    ];
  }
  return [];
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  const items = navFor(session?.user.role);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-ink-950 font-archivo text-fg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-44 h-[360px] w-[420px] bg-[radial-gradient(ellipse_at_center,rgba(245,196,81,0.13),rgba(245,196,81,0)_65%)]"
      />
      <div className="relative mx-auto w-full max-w-2xl pb-36 pt-7">
        {children}
      </div>
      {items.length > 0 && <BottomNav items={items} />}
    </main>
  );
};

export default RootLayout;
