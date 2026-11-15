import { UserRole } from "@/types/nextauth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isAdmin = (role?: UserRole | undefined | string) => {
  return role === "admin";
};

export const canSeeInventory = (role?: UserRole | string) =>
  role === "business" || role === "staff" || role === "admin";

export const canSeeCityStock = (role?: UserRole | string) =>
  role === "staff" || role === "admin";

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const IST = "Asia/Kolkata";

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatDay = (iso: string, now = new Date()) => {
  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: IST });
  const date = new Date(iso);
  if (day(date) === day(now)) return "Today";
  if (day(date) === day(new Date(now.getTime() - 86_400_000))) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-IN", {
    timeZone: IST,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(day(date).slice(0, 4) !== day(now).slice(0, 4) && { year: "numeric" }),
  });
};

export const formatWhen = (iso: string, now = new Date()) => {
  const date = new Date(iso);
  const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: IST });
  const time = date.toLocaleTimeString("en-IN", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (day(date) === day(now)) return `Today ${time}`;
  if (day(date) === day(new Date(now.getTime() - 86_400_000))) {
    return `Yesterday ${time}`;
  }
  return date.toLocaleDateString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    ...(day(date).slice(0, 4) !== day(now).slice(0, 4) && { year: "numeric" }),
  });
};
