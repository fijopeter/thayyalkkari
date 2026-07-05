import { useEffect, useSyncExternalStore } from "react";
import type { ApprovalStatus, NewShopInput, Shop, ShopProduct, ShopService } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { slugify } from "@/lib/slugify";
import { deleteImage } from "@/lib/imageUpload";
import {
  newShopToRow,
  productToRow,
  rowToShop,
  serviceToRow,
  shopPatchToRow,
  type ShopRow,
} from "@/store/mappers";

const SELECT = "*, services(*), products(*), reviews(*), showcase_images(*)";
const UNIQUE_VIOLATION = "23505";

interface ShopsSnapshot {
  shops: Shop[];
  loading: boolean;
  error: string | null;
}

let snapshot: ShopsSnapshot = { shops: [], loading: true, error: null };
const subscribers = new Set<() => void>();

function notify(next: Partial<ShopsSnapshot>) {
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

export async function refetchShops(): Promise<void> {
  notify({ loading: true, error: null });
  const { data, error } = await supabase
    .from("shops")
    .select(SELECT)
    .order("created_at", { ascending: true });

  if (error) {
    notify({ loading: false, error: error.message });
    return;
  }
  notify({ shops: (data as ShopRow[]).map(rowToShop), loading: false, error: null });
}

let initiated = false;
function ensureLoaded() {
  if (!initiated) {
    initiated = true;
    void refetchShops();
  }
}

function useShopsSnapshot(): ShopsSnapshot {
  useEffect(() => {
    ensureLoaded();
  }, []);
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Live list of every shop the current session is allowed to see (RLS-scoped: public + your own + all if superadmin). */
export function useShops(): Shop[] {
  return useShopsSnapshot().shops;
}

export function useShopsLoading(): boolean {
  return useShopsSnapshot().loading;
}

export function useShopBySlug(slug: string | undefined): Shop | undefined {
  const shops = useShops();
  return slug ? shops.find((shop) => shop.slug === slug) : undefined;
}

export function useShopById(id: string | undefined): Shop | undefined {
  const shops = useShops();
  return id ? shops.find((shop) => shop.id === id) : undefined;
}

export function useAllProducts(): { product: ShopProduct; shop: Shop }[] {
  const shops = useShops();
  return shops.flatMap((shop) => shop.products.map((product) => ({ product, shop })));
}

/**
 * Creates the caller's shop (owner_id is set server-side from the session)
 * and links it back to their profile (profiles.shop_id) so the rest of the
 * app — the dashboard redirect, the pending-approval screen, the header's
 * Dashboard button — knows this user owns a shop. Retries once on a slug
 * clash.
 */
export async function createShop(input: NewShopInput): Promise<{ shop?: Shop; error?: string }> {
  const base = slugify(input.slug || input.name) || "shop";
  let slug = base;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("shops")
      .insert({ ...newShopToRow(input), slug })
      .select(SELECT)
      .single();

    if (!error) {
      const shop = rowToShop(data as ShopRow);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ shop_id: shop.id }).eq("id", user.id);
      }

      await refetchShops();
      return { shop };
    }
    if (error.code === UNIQUE_VIOLATION) {
      // Two different constraints can raise this code: the slug clash we
      // retry below, and shops.owner_id's uniqueness (one shop per person),
      // which retrying can never fix.
      if (error.message.includes("owner_id")) {
        return { error: "You already have a shop registered — only one shop is allowed per account." };
      }
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not generate a unique shop URL — try a different name." };
}

export async function updateShop(
  id: string,
  patch: Partial<Omit<Shop, "id" | "ownerId">>,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("shops").update(shopPatchToRow(patch)).eq("id", id);
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

/** Superadmin-only in practice (RLS blocks the status change otherwise). */
export async function setShopApproval(id: string, status: ApprovalStatus): Promise<{ error?: string }> {
  return updateShop(id, { status });
}

/**
 * `images` — every R2 URL that belonged only to this shop (banner, logo, and
 * every product's photo). Pass them so they're cleaned up alongside the
 * rows, which cascade-delete in Postgres but wouldn't otherwise free the
 * corresponding R2 storage. Best-effort: cleanup failures don't block the
 * shop deletion, which has already succeeded by that point.
 */
export async function deleteShop(id: string, images: string[] = []): Promise<{ error?: string }> {
  const { error } = await supabase.from("shops").delete().eq("id", id);
  if (error) return { error: error.message };
  await Promise.all(images.filter(Boolean).map((url) => deleteImage(url)));
  await refetchShops();
  return {};
}

export async function addService(
  shopId: string,
  service: Omit<ShopService, "id" | "shopId">,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("services").insert(serviceToRow(shopId, service));
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

export async function updateService(
  _shopId: string,
  serviceId: string,
  patch: Partial<Omit<ShopService, "id" | "shopId">>,
): Promise<{ error?: string }> {
  const row: Record<string, unknown> = {};
  if (patch.title) {
    row.title_en = patch.title.en;
    row.title_ml = patch.title.ml;
  }
  if (patch.description) {
    row.description_en = patch.description.en;
    row.description_ml = patch.description.ml;
  }
  if (patch.estimatedDays !== undefined) row.estimated_days = patch.estimatedDays;
  if (patch.priceRange !== undefined) row.price_range = patch.priceRange ?? null;

  const { error } = await supabase.from("services").update(row).eq("id", serviceId);
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

export async function deleteService(_shopId: string, serviceId: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("services").delete().eq("id", serviceId);
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

export async function addProduct(
  shopId: string,
  product: Omit<ShopProduct, "id" | "shopId">,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("products").insert(productToRow(shopId, product));
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

export async function updateProduct(
  _shopId: string,
  productId: string,
  patch: Partial<Omit<ShopProduct, "id" | "shopId">>,
): Promise<{ error?: string }> {
  const row: Record<string, unknown> = {};
  if (patch.name) {
    row.name_en = patch.name.en;
    row.name_ml = patch.name.ml;
  }
  if (patch.category) {
    row.category_en = patch.category.en;
    row.category_ml = patch.category.ml;
  }
  if (patch.description) {
    row.description_en = patch.description.en;
    row.description_ml = patch.description.ml;
  }
  if (patch.image !== undefined) row.image = patch.image;
  if (patch.size !== undefined) row.size = patch.size ?? null;
  if (patch.price !== undefined) row.price = patch.price ?? null;
  if (patch.enquiryOnly !== undefined) row.enquiry_only = patch.enquiryOnly;

  const { error } = await supabase.from("products").update(row).eq("id", productId);
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

export async function deleteProduct(
  _shopId: string,
  productId: string,
  imageUrl?: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };
  if (imageUrl) await deleteImage(imageUrl);
  await refetchShops();
  return {};
}

export async function addShowcaseImage(shopId: string, image: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("showcase_images").insert({ shop_id: shopId, image });
  if (error) return { error: error.message };
  await refetchShops();
  return {};
}

export async function deleteShowcaseImage(
  imageId: string,
  imageUrl?: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("showcase_images").delete().eq("id", imageId);
  if (error) return { error: error.message };
  if (imageUrl) await deleteImage(imageUrl);
  await refetchShops();
  return {};
}
