/**
 * Thin localStorage JSON helpers used by the data stores.
 *
 * This is a placeholder persistence layer only — it lives in one browser, isn't
 * shared across devices, and disappears if the user clears site data. It exists
 * so the admin panels (src/pages/admin) are usable today; see README "Migrating
 * off local storage" for the path to a real backend (Supabase recommended).
 */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — edits simply won't persist.
  }
}
