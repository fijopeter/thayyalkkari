/**
 * Free-tier ceilings used for the capacity-check hooks and the superadmin
 * storage widgets. These are the frontend's copy — keep in sync with the
 * hardcoded limits in `supabase/schema.sql` (enforce_db_size_limit) and
 * `worker/src/index.ts` (R2_FREE_TIER_BYTES), which are what actually enforce
 * the lock server-side. Update all three if your plan changes.
 */
export const DB_FREE_TIER_BYTES = 500 * 1024 * 1024; // Supabase Postgres free tier
export const R2_FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024; // Cloudflare R2 free tier
