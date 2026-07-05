import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DB_FREE_TIER_BYTES } from "@/lib/storageLimits";

export interface CapacityStatus {
  bytes: number | null;
  limitBytes: number;
  /** True once usage has reached the free-tier ceiling — the DB will reject new inserts. */
  atLimit: boolean;
  loading: boolean;
  error: string | null;
}

/** Tracks Supabase Postgres storage usage so "Add" buttons can warn/disable before hitting the server-side lock. */
export function useDbCapacity(): CapacityStatus {
  const [bytes, setBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase.rpc("get_database_size");
      if (err) setError(err.message);
      else setBytes(Number(data));
      setLoading(false);
    }
    void load();
  }, []);

  return {
    bytes,
    limitBytes: DB_FREE_TIER_BYTES,
    atLimit: bytes !== null && bytes >= DB_FREE_TIER_BYTES,
    loading,
    error,
  };
}
