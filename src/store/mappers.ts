import type {
  ApprovalStatus,
  LocalizedText,
  NewShopInput,
  OrderStatus,
  Shop,
  ShopProduct,
  ShopReview,
  ShopService,
  ShowcaseImage,
  TrackingOrder,
} from "@/types";
import { buildTimeline, progressFor } from "@/data/trackingOrders";

// Row shapes mirror supabase/schema.sql exactly.

export interface ServiceRow {
  id: string;
  shop_id: string;
  title_en: string;
  title_ml: string;
  description_en: string;
  description_ml: string;
  estimated_days: string;
  price_range: string | null;
}

export interface ProductRow {
  id: string;
  shop_id: string;
  name_en: string;
  name_ml: string;
  category_en: string;
  category_ml: string;
  description_en: string;
  description_ml: string;
  image: string;
  size: string | null;
  price: number | null;
  enquiry_only: boolean;
}

export interface ReviewRow {
  id: string;
  shop_id: string;
  customer_name: string;
  rating: number;
  comment_en: string;
  comment_ml: string;
}

export interface ShowcaseImageRow {
  id: string;
  shop_id: string;
  image: string;
}

export interface ShopRow {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  malayalam_name: string | null;
  tagline_en: string;
  tagline_ml: string;
  description_en: string;
  description_ml: string;
  location: string;
  address_en: string;
  address_ml: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  banner_image: string;
  logo_image: string | null;
  years_of_experience: number;
  categories: LocalizedText[];
  badges: LocalizedText[] | null;
  rating: number;
  review_count: number;
  working_days_en: string;
  working_days_ml: string;
  working_hours: string;
  show_call: boolean;
  show_whatsapp: boolean;
  show_email: boolean;
  status: ApprovalStatus;
  services?: ServiceRow[];
  products?: ProductRow[];
  reviews?: ReviewRow[];
  showcase_images?: ShowcaseImageRow[];
}

export interface OrderRow {
  code: string;
  shop_id: string;
  customer_name: string;
  item_type_en: string;
  item_type_ml: string;
  order_date: string;
  expected_date: string;
  status: OrderStatus;
}

export function rowToService(row: ServiceRow): ShopService {
  return {
    id: row.id,
    shopId: row.shop_id,
    title: { en: row.title_en, ml: row.title_ml },
    description: { en: row.description_en, ml: row.description_ml },
    estimatedDays: row.estimated_days,
    priceRange: row.price_range ?? undefined,
  };
}

export function serviceToRow(shopId: string, service: Omit<ShopService, "id" | "shopId">) {
  return {
    shop_id: shopId,
    title_en: service.title.en,
    title_ml: service.title.ml,
    description_en: service.description.en,
    description_ml: service.description.ml,
    estimated_days: service.estimatedDays,
    price_range: service.priceRange ?? null,
  };
}

export function rowToProduct(row: ProductRow): ShopProduct {
  return {
    id: row.id,
    shopId: row.shop_id,
    name: { en: row.name_en, ml: row.name_ml },
    category: { en: row.category_en, ml: row.category_ml },
    image: row.image,
    description: { en: row.description_en, ml: row.description_ml },
    size: row.size ?? undefined,
    price: row.price ?? undefined,
    enquiryOnly: row.enquiry_only,
  };
}

export function productToRow(shopId: string, product: Omit<ShopProduct, "id" | "shopId">) {
  return {
    shop_id: shopId,
    name_en: product.name.en,
    name_ml: product.name.ml,
    category_en: product.category.en,
    category_ml: product.category.ml,
    description_en: product.description.en,
    description_ml: product.description.ml,
    image: product.image,
    size: product.size ?? null,
    price: product.price ?? null,
    enquiry_only: !!product.enquiryOnly,
  };
}

export function rowToReview(row: ReviewRow): ShopReview {
  return {
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    comment: { en: row.comment_en, ml: row.comment_ml },
  };
}

export function rowToShowcaseImage(row: ShowcaseImageRow): ShowcaseImage {
  return { id: row.id, shopId: row.shop_id, image: row.image };
}

export function rowToShop(row: ShopRow): Shop {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    malayalamName: row.malayalam_name ?? undefined,
    tagline: { en: row.tagline_en, ml: row.tagline_ml },
    description: { en: row.description_en, ml: row.description_ml },
    location: row.location,
    address: { en: row.address_en, ml: row.address_ml },
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email ?? undefined,
    bannerImage: row.banner_image,
    logoImage: row.logo_image ?? undefined,
    yearsOfExperience: row.years_of_experience,
    categories: row.categories ?? [],
    badges: row.badges ?? undefined,
    rating: row.rating,
    reviewCount: row.review_count,
    workingHours: { days: { en: row.working_days_en, ml: row.working_days_ml }, hours: row.working_hours },
    showCall: row.show_call,
    showWhatsapp: row.show_whatsapp,
    showEmail: row.show_email,
    status: row.status,
    services: (row.services ?? []).map(rowToService),
    products: (row.products ?? []).map(rowToProduct),
    reviews: (row.reviews ?? []).map(rowToReview),
    showcaseImages: (row.showcase_images ?? []).map(rowToShowcaseImage),
  };
}

export function newShopToRow(input: NewShopInput) {
  return {
    slug: input.slug,
    name: input.name,
    malayalam_name: input.malayalamName ?? null,
    tagline_en: input.tagline.en,
    tagline_ml: input.tagline.ml,
    description_en: input.description.en,
    description_ml: input.description.ml,
    location: input.location,
    address_en: input.address.en,
    address_ml: input.address.ml,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email ?? null,
    banner_image: input.bannerImage,
    logo_image: input.logoImage ?? null,
    years_of_experience: input.yearsOfExperience,
    categories: input.categories,
    badges: input.badges ?? [],
    working_days_en: input.workingHours.days.en,
    working_days_ml: input.workingHours.days.ml,
    working_hours: input.workingHours.hours,
    show_call: input.showCall,
    show_whatsapp: input.showWhatsapp,
    show_email: input.showEmail,
  };
}

export function shopPatchToRow(patch: Partial<Omit<Shop, "id" | "ownerId">>) {
  const row: Record<string, unknown> = {};
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.malayalamName !== undefined) row.malayalam_name = patch.malayalamName ?? null;
  if (patch.tagline !== undefined) {
    row.tagline_en = patch.tagline.en;
    row.tagline_ml = patch.tagline.ml;
  }
  if (patch.description !== undefined) {
    row.description_en = patch.description.en;
    row.description_ml = patch.description.ml;
  }
  if (patch.location !== undefined) row.location = patch.location;
  if (patch.address !== undefined) {
    row.address_en = patch.address.en;
    row.address_ml = patch.address.ml;
  }
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.whatsapp !== undefined) row.whatsapp = patch.whatsapp;
  if (patch.email !== undefined) row.email = patch.email ?? null;
  if (patch.bannerImage !== undefined) row.banner_image = patch.bannerImage;
  if (patch.logoImage !== undefined) row.logo_image = patch.logoImage ?? null;
  if (patch.yearsOfExperience !== undefined) row.years_of_experience = patch.yearsOfExperience;
  if (patch.categories !== undefined) row.categories = patch.categories;
  if (patch.badges !== undefined) row.badges = patch.badges ?? [];
  if (patch.workingHours !== undefined) {
    row.working_days_en = patch.workingHours.days.en;
    row.working_days_ml = patch.workingHours.days.ml;
    row.working_hours = patch.workingHours.hours;
  }
  if (patch.showCall !== undefined) row.show_call = patch.showCall;
  if (patch.showWhatsapp !== undefined) row.show_whatsapp = patch.showWhatsapp;
  if (patch.showEmail !== undefined) row.show_email = patch.showEmail;
  if (patch.status !== undefined) row.status = patch.status;
  return row;
}

export function rowToOrder(row: OrderRow): TrackingOrder {
  return {
    code: row.code,
    shopId: row.shop_id,
    customerName: row.customer_name,
    itemType: { en: row.item_type_en, ml: row.item_type_ml },
    orderDate: row.order_date,
    expectedDate: row.expected_date,
    status: row.status,
    progressPercent: progressFor(row.status),
    timelineSteps: buildTimeline(row.status, row.order_date),
  };
}
