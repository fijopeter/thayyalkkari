import { useEffect, useSyncExternalStore } from "react";
import type { LocalizedText, OrderStatus, TrackingOrder } from "@/types";
import { ORDER_STATUS_SEQUENCE } from "@/data/trackingOrders";
import { supabase } from "@/lib/supabaseClient";
import { rowToOrder, type OrderRow } from "@/store/mappers";

export { ORDER_STATUS_SEQUENCE };

interface OrdersSnapshot {
  orders: TrackingOrder[];
  loading: boolean;
  error: string | null;
}

let snapshot: OrdersSnapshot = { orders: [], loading: true, error: null };
const subscribers = new Set<() => void>();

function notify(next: Partial<OrdersSnapshot>) {
  snapshot = { ...snapshot, ...next };
  subscribers.forEach((cb) => cb());
}
function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
function getSnapshot() {
  return snapshot;
}

/**
 * Loads every order the current session can see (shop owner: their own shop's
 * orders; superadmin: all). This deliberately never powers the public /track
 * page — that goes through the lookup_tracking_code() RPC instead, which is
 * the only way anonymous visitors can read a single order (see
 * supabase/schema.sql for why: no public SELECT policy on this table).
 */
export async function refetchOrders(): Promise<void> {
  notify({ loading: true, error: null });
  const { data, error } = await supabase
    .from("tracking_orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    notify({ loading: false, error: error.message });
    return;
  }
  notify({ orders: (data as OrderRow[]).map(rowToOrder), loading: false, error: null });
}

let initiated = false;
function ensureLoaded() {
  if (!initiated) {
    initiated = true;
    void refetchOrders();
  }
}

function useOrdersSnapshot(): OrdersSnapshot {
  useEffect(() => {
    ensureLoaded();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useOrders(): TrackingOrder[] {
  return useOrdersSnapshot().orders;
}

export function useOrdersForShop(shopId: string): TrackingOrder[] {
  const orders = useOrders();
  return orders.filter((order) => order.shopId === shopId);
}

/** Public, unauthenticated lookup used by /track — goes through the SECURITY DEFINER RPC, not the table directly. */
export async function lookupTrackingCode(code: string): Promise<TrackingOrder | null> {
  const { data, error } = await supabase.rpc("lookup_tracking_code", { p_code: code.trim() });
  if (error || !data || data.length === 0) return null;
  return rowToOrder(data[0] as OrderRow);
}

function nextTrackingCode(existing: TrackingOrder[]): string {
  const numbers = existing
    .map((order) => Number(order.code.replace(/^TK-/i, "")))
    .filter((n) => Number.isFinite(n));
  const next = (numbers.length ? Math.max(...numbers) : 1000) + 1;
  return `TK-${next}`;
}

export interface NewOrderInput {
  shopId: string;
  customerName: string;
  itemType: LocalizedText;
  orderDate: string;
  expectedDate: string;
  status: OrderStatus;
}

export async function createOrder(input: NewOrderInput): Promise<{ order?: TrackingOrder; error?: string }> {
  const code = nextTrackingCode(snapshot.orders);
  const { data, error } = await supabase
    .from("tracking_orders")
    .insert({
      code,
      shop_id: input.shopId,
      customer_name: input.customerName,
      item_type_en: input.itemType.en,
      item_type_ml: input.itemType.ml,
      order_date: input.orderDate,
      expected_date: input.expectedDate,
      status: input.status,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };
  await refetchOrders();
  return { order: rowToOrder(data as OrderRow) };
}

export async function updateOrderStatus(code: string, status: OrderStatus): Promise<{ error?: string }> {
  const { error } = await supabase.from("tracking_orders").update({ status }).eq("code", code);
  if (error) return { error: error.message };
  await refetchOrders();
  return {};
}

export async function deleteOrder(code: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("tracking_orders").delete().eq("code", code);
  if (error) return { error: error.message };
  await refetchOrders();
  return {};
}
