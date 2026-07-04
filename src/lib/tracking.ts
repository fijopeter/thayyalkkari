import { ORDER_STATUS_SEQUENCE, lookupTrackingCode as lookupTrackingCodeRemote } from "@/store/ordersStore";
import type { OrderStatus, TrackingOrder } from "@/types";

export type TrackingLookupResult =
  | { found: true; order: TrackingOrder }
  | { found: false };

/** Looks up an order by tracking code via the public Supabase RPC (see supabase/schema.sql). */
export async function lookupTrackingCode(code: string): Promise<TrackingLookupResult> {
  const order = await lookupTrackingCodeRemote(code);
  if (!order) return { found: false };
  return { found: true, order };
}

export function statusIndex(status: OrderStatus): number {
  return ORDER_STATUS_SEQUENCE.indexOf(status);
}

export function isOrderComplete(status: OrderStatus): boolean {
  return status === "completed" || status === "delivered";
}
