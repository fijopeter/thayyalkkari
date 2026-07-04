// Core domain types for Thayyalkkari.
// Backed by Supabase (Postgres) — see supabase/schema.sql for the source of truth
// these are mapped from/to (src/store/mappers.ts).

export type Language = "ml" | "en";

export interface LocalizedText {
  ml: string;
  en: string;
}

export interface WorkingHours {
  days: LocalizedText;
  hours: string;
}

export interface ShopService {
  id: string;
  shopId: string;
  title: LocalizedText;
  description: LocalizedText;
  estimatedDays: string;
  priceRange?: string;
}

export interface ShopProduct {
  id: string;
  shopId: string;
  name: LocalizedText;
  category: LocalizedText;
  image: string;
  description: LocalizedText;
  size?: string;
  price?: number;
  enquiryOnly?: boolean;
}

export interface ShopReview {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: LocalizedText;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Shop {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  malayalamName?: string;
  tagline: LocalizedText;
  description: LocalizedText;
  location: string;
  address: LocalizedText;
  phone: string;
  whatsapp: string; // digits only, with country code, e.g. 919876543210
  email?: string;
  bannerImage: string;
  logoImage?: string;
  yearsOfExperience: number;
  categories: LocalizedText[];
  badges?: LocalizedText[];
  rating: number;
  reviewCount: number;
  services: ShopService[];
  products: ShopProduct[];
  reviews: ShopReview[];
  workingHours: WorkingHours;
  /** Per-shop toggles for which contact methods show on the public shop page. */
  showCall: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
  /** Set by superadmin approval — pending shops aren't publicly visible. */
  status: ApprovalStatus;
}

/** Input for a shop owner's self-service "create my shop" step during registration. */
export type NewShopInput = Omit<
  Shop,
  | "id"
  | "ownerId"
  | "slug"
  | "services"
  | "products"
  | "reviews"
  | "rating"
  | "reviewCount"
  | "status"
> & { slug?: string };

export type UserRole = "admin" | "superadmin";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  status: ApprovalStatus;
  shopId: string | null;
}

export type OrderStatus =
  | "order_received"
  | "measurement_taken"
  | "cutting_started"
  | "stitching_in_progress"
  | "finishing_work"
  | "ready_for_trial"
  | "completed"
  | "delivered";

export interface TimelineStep {
  status: OrderStatus;
  date?: string; // ISO date, present if step already reached
  done: boolean;
}

export interface TrackingOrder {
  code: string;
  shopId: string;
  customerName: string;
  itemType: LocalizedText;
  orderDate: string; // ISO date
  expectedDate: string; // ISO date
  progressPercent: number;
  status: OrderStatus;
  timelineSteps: TimelineStep[];
}

export interface StitchingRequestFormData {
  shopId: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  dressType: string;
  fabricDetails: string;
  measurementsNotes: string;
  preferredDeliveryDate: string;
  additionalInstructions: string;
  referenceImage?: File | null;
}
