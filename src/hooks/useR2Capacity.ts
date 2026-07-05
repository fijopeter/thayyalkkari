import { useEffect, useState } from "react";
import { getStorageUsage, ImageUploadNotConfiguredError } from "@/lib/imageUpload";
import { R2_FREE_TIER_BYTES } from "@/lib/storageLimits";

export interface R2CapacityStatus {
  bytes: number | null;
  limitBytes: number;
  /** True once usage has reached the free-tier ceiling — the Worker will reject new uploads. */
  atLimit: boolean;
  loading: boolean;
  error: string | null;
  /** True when VITE_UPLOAD_WORKER_URL / VITE_UPLOAD_TOKEN aren't set — not an error, just not set up yet. */
  notConfigured: boolean;
}

/** Tracks Cloudflare R2 storage usage so "Upload Photo" can warn/disable before hitting the server-side lock. */
export function useR2Capacity(): R2CapacityStatus {
  const [bytes, setBytes] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStorageUsage()
      .then((usage) => setBytes(usage.bytes))
      .catch((err) => {
        if (err instanceof ImageUploadNotConfiguredError) setNotConfigured(true);
        else setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    bytes,
    limitBytes: R2_FREE_TIER_BYTES,
    atLimit: bytes !== null && bytes >= R2_FREE_TIER_BYTES,
    loading,
    error,
    notConfigured,
  };
}
