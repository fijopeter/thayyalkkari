import type { Profile, Shop } from "@/types";

/** Where the header's "Dashboard" button (and post-login redirect) should send a logged-in user. */
export function dashboardPathForProfile(profile: Profile | null, shops: Shop[]): string {
  if (!profile) return "/login";
  if (profile.role === "superadmin") return "/superadmin";
  if (!profile.shopId) return "/add-shop";
  const shop = shops.find((s) => s.id === profile.shopId);
  if (!shop) return "/pending-approval";
  return `/shop/${shop.slug}/admin`;
}
