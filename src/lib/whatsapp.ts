import type { Shop, ShopProduct, StitchingRequestFormData } from "@/types";
import type { Language } from "@/types";
import { t } from "@/lib/utils";

function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digitsOnly = whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

/** Builds a wa.me link with a prefilled stitching-request message for a shop. */
export function buildStitchingRequestWhatsAppUrl(
  shop: Shop,
  data: StitchingRequestFormData,
): string {
  const contactNumber = data.sameAsPhone ? data.phone : data.whatsapp;

  const lines = [
    `*New Stitching Request — ${shop.name}*`,
    ``,
    `Name: ${data.customerName}`,
    `Phone: ${data.phone}`,
    contactNumber ? `WhatsApp: ${contactNumber}` : null,
    `Dress type: ${data.dressType}`,
    data.fabricDetails ? `Fabric/material: ${data.fabricDetails}` : null,
    data.measurementsNotes ? `Measurements/notes: ${data.measurementsNotes}` : null,
    data.preferredDeliveryDate ? `Preferred delivery: ${data.preferredDeliveryDate}` : null,
    data.additionalInstructions ? `Instructions: ${data.additionalInstructions}` : null,
    ``,
    `(Sent via Thayyalkkari app)`,
  ].filter((line): line is string => Boolean(line));

  return buildWhatsAppUrl(shop.whatsapp, lines.join("\n"));
}

/** Builds a wa.me link with a prefilled enquiry message for a product/dress. */
export function buildProductEnquiryWhatsAppUrl(
  shop: Shop,
  product: ShopProduct,
  lang: Language,
): string {
  const lines = [
    `Hi, I'm interested in this item from *${shop.name}*:`,
    ``,
    `Item: ${t(product.name, lang)}`,
    `Category: ${t(product.category, lang)}`,
    product.size ? `Size: ${product.size}` : null,
    product.price ? `Listed price: ₹${product.price}` : `Price: Please share details`,
    ``,
    `Could you share more details / availability?`,
    `(Sent via Thayyalkkari app)`,
  ].filter((line): line is string => Boolean(line));

  return buildWhatsAppUrl(shop.whatsapp, lines.join("\n"));
}

/** Builds a generic wa.me link for "Chat / Enquire" CTAs on a shop page. */
export function buildShopEnquiryWhatsAppUrl(shop: Shop): string {
  const message = `Hi ${shop.name}, I found your shop on Thayyalkkari and would like to enquire.`;
  return buildWhatsAppUrl(shop.whatsapp, message);
}
