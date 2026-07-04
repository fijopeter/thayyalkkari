import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set — see docs/SUPABASE_SETUP.md. */
export const supabaseConfigured = Boolean(url && anonKey);

// A syntactically-valid placeholder so createClient doesn't throw before env vars
// are set; every call will simply fail until they're configured.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
);
