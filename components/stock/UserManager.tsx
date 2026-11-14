"use client";

import { Check, ChevronRight } from "lucide-react";
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
import { setUserRole, UserRow } from "@/lib/actions/user.actions";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    value: "user",
    label: "No access",
    detail: "Can sign in but sees no stock.",
  },
  {
    value: "business",
    label: "Business",
    detail: "Sees products and total stock only.",
  },
  {
    value: "staff",
    label: "Staff",
    detail: "Sees stock in every city and each product's changes.",
  },
] as const;

type AssignableRole = (typeof ROLES)[number]["value"];

const ROLE_LABEL: Record<string, string> = {
  user: "NO ACCESS",
  business: "BUSINESS",
  staff: "STAFF",
  admin: "ADMIN",
};

const badgeClass: Record<string, string> = {
  user: "border-low/40 text-low",
  business: "border-white/[0.12] text-[#D4D4D4]",
  staff: "border-gold/40 text-gold",
  admin: "border-fg bg-fg text-ink-950",
};

const joined = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const UserManager = ({ users }: { users: UserRow[] }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [role, setRole] = useState<AssignableRole>("user");

  const locked = !!editing && (editing.isYou || editing.role === "admin");

  const pick = (user: UserRow) => {
    setEditing(user);
    setRole(
      ROLES.find((r) => r.value === user.role)?.value ?? ("user" as const)
    );
    setOpen(true);
  };

  const save = () =>
    startTransition(async () => {
      if (!editing) return;
      const result = await setUserRole({ userID: editing._id, role });
      if (!result.success) {
        toast.error(result.error?.message ?? "Could not change the role.");
        return;
      }
      const label = ROLES.find((r) => r.value === role)?.label ?? role;
      toast.success(`${editing.name} is now ${label}`);
      setOpen(false);
      router.refresh();
    });

  if (users.length === 0) {
    return (
      <p className="mx-4 rounded-3xl border border-white/[0.06] bg-ink-900 p-8 text-center text-sm text-fg-muted">
        No users match.
      </p>
    );
  }

  return (
    <>
      <ul className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
        {users.map((u) => (
          <li key={u._id} className="border-b border-white/5 last:border-b-0">
            <button
              type="button"
              onClick={() => pick(u)}
              className="flex w-full items-center gap-3.5 p-[18px] text-left active:bg-white/[0.03]"
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.08] bg-raised text-[15px] font-extrabold uppercase text-gold shadow-raised"
              >
                {u.name.charAt(0)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                <span className="truncate text-[15px] font-semibold">
                  {u.name}
                  {u.isYou && <span className="text-fg-faint"> · you</span>}
                </span>
                <span className="truncate text-xs text-fg-muted">
                  {u.email}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.06em]",
                  badgeClass[u.role] ?? badgeClass.business
                )}
              >
                {ROLE_LABEL[u.role] ?? u.role.toUpperCase()}
              </span>
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-fg-faint"
              />
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[92vh] flex-col gap-5 overflow-y-auto rounded-t-[28px] border-white/10 bg-gradient-to-b from-[#1A1A1D] to-[#0C0C0E] px-5 pb-8 pt-3 font-archivo text-fg"
        >
          <span className="mx-auto h-[5px] w-10 shrink-0 rounded-full bg-ink-600" />
          <div className="flex min-w-0 flex-col gap-1 pr-8">
            <SheetTitle className="font-wide truncate text-[22px] font-black uppercase text-fg">
              {editing?.name}
            </SheetTitle>
            <SheetDescription className="truncate text-sm text-fg-muted">
              {editing &&
                `${editing.email} · joined ${joined(editing.createdAt)}`}
            </SheetDescription>
          </div>

          {locked ? (
            <p className="rounded-[20px] border border-white/[0.07] bg-tile p-5 text-sm text-fg-muted">
              {editing?.isYou
                ? "This is your account. Your own role cannot be changed here."
                : "Admin accounts cannot be changed here."}
            </p>
          ) : (
            <>
              <div
                role="radiogroup"
                aria-label="Access"
                className="flex flex-col gap-2"
              >
                {ROLES.map((r) => {
                  const selected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setRole(r.value)}
                      className={cn(
                        "flex min-h-[68px] items-center gap-3.5 rounded-2xl border px-4 py-3 text-left",
                        selected
                          ? "border-gold/50 bg-gold/[0.1]"
                          : "border-white/[0.08] active:bg-white/5"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-[15px] font-bold">{r.label}</span>
                        <span className="text-xs text-fg-muted">
                          {r.detail}
                        </span>
                      </div>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border",
                          selected
                            ? "border-gold bg-gold text-gold-ink"
                            : "border-white/20"
                        )}
                      >
                        {selected && (
                          <Check className="size-4" strokeWidth={3} />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="gold"
                size="tap"
                disabled={pending || role === editing?.role}
                onClick={save}
              >
                {pending ? "Saving..." : "Save access"}
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default UserManager;
