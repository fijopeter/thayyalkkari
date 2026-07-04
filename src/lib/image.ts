import type { SyntheticEvent } from "react";

/** Soft on-brand "image unavailable" placeholder, inlined so it never itself 404s. */
export const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f9f3ea'/%3E%3Cg fill='none' stroke='%23e3b7bd' stroke-width='10' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='90' y='110' width='220' height='180' rx='14'/%3E%3Ccircle cx='150' cy='170' r='18'/%3E%3Cpath d='M90 260l60-60 50 50 40-40 70 70'/%3E%3C/g%3E%3C/svg%3E";

/** Swaps a broken <img>/<motion.img> src to the fallback placeholder, once. */
export function handleImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = IMAGE_FALLBACK;
}
