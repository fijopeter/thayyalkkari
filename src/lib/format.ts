import type { Language } from "@/types";

export function formatCurrency(amount: number, lang: Language): string {
  return new Intl.NumberFormat(lang === "ml" ? "ml-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoDate: string, lang: Language): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(lang === "ml" ? "ml-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
