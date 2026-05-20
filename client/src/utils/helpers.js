import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const difficultyColor = (difficulty) => {
  const map = { easy: "text-green-600", medium: "text-yellow-600", hard: "text-red-600" };
  return map[difficulty] ?? "text-muted-foreground";
};

export const difficultyBadgeVariant = (difficulty) => {
  const map = { easy: "success", medium: "warning", hard: "destructive" };
  return map[difficulty] ?? "secondary";
};

export const scoreColor = (score) => {
  if (score >= 8) return "text-green-600";
  if (score >= 5) return "text-yellow-600";
  return "text-red-600";
};

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
