import { techMap } from "@/constants/techMap";
import { UserRole } from "@/types/nextauth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDeviconClassName = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .]/g, "").toLowerCase();

  return techMap[normalizedTechName]
    ? `${techMap[normalizedTechName]} colored`
    : "devicon-devicon-plain";
};

export const getTimeStamp = (createdAt: Date) => {
  const date = new Date(createdAt);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];
  for (const unit of units) {
    const interval = Math.floor(secondsAgo / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

export const isAdmin = (role?: UserRole | undefined | string) => {
  return role === "admin";
};

export const canSeeInventory = (role?: UserRole | string) =>
  role === "business" || role === "staff" || role === "admin";

export const canSeeCityStock = (role?: UserRole | string) =>
  role === "staff" || role === "admin";

export const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isBusinessAccount = (role?: UserRole | undefined | string) => {
  return role === "admin";
};

const IST = "Asia/Kolkata";

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
