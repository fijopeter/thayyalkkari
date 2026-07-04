/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Deployed Cloudflare Worker URL that proxies uploads to R2 — see docs/CLOUDFLARE_R2_SETUP.md. */
  readonly VITE_UPLOAD_WORKER_URL?: string;
  /** Shared bearer token the worker checks before accepting an upload. */
  readonly VITE_UPLOAD_TOKEN?: string;
  /** Supabase project URL — see docs/SUPABASE_SETUP.md. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) API key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
