"use client";

import { LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  email?: string | null;
  role?: string;
  signOutAction: () => Promise<void>;
}

const AccountMenu = ({ name, email, role, signOutAction }: Props) => (
  <Sheet>
    <SheetTrigger
      aria-label="Account"
      className="flex size-11 items-center justify-center rounded-[14px] border border-white/[0.08] bg-raised text-[15px] font-extrabold uppercase text-gold shadow-raised"
    >
      {name.charAt(0)}
    </SheetTrigger>
    <SheetContent
      side="bottom"
      className="flex flex-col gap-5 rounded-t-[28px] border-white/10 bg-gradient-to-b from-[#1A1A1D] to-[#0C0C0E] px-5 pb-8 pt-3 font-archivo text-fg"
    >
      <span className="mx-auto h-[5px] w-10 rounded-full bg-ink-600" />
      <div className="flex flex-col gap-1.5">
        <SheetTitle className="font-wide text-xl font-black text-fg">
          {name}
        </SheetTitle>
        <SheetDescription className="text-sm text-fg-muted">
          {email}
          {role && (
            <span className="ml-2 rounded-full border border-gold/35 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gold">
              {role}
            </span>
          )}
        </SheetDescription>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="raised" size="tap" className="w-full">
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </form>
    </SheetContent>
  </Sheet>
);

export default AccountMenu;
