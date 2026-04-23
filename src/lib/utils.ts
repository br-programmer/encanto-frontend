import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { findCountryByDialCode } from "./countries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from cents to display format
 * @param cents - Price in cents
 * @returns Formatted price string (e.g., "$35.00")
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Calculate discount percentage between original and current price
 * @param priceCents - Current price in cents
 * @param comparePriceCents - Original price in cents (optional)
 * @returns Discount percentage (e.g., 18 for 18%) or null if no discount
 */
export function calculateDiscount(
  priceCents: number,
  comparePriceCents?: number | null
): number | null {
  if (!comparePriceCents || comparePriceCents <= priceCents) return null;
  return Math.round(((comparePriceCents - priceCents) / comparePriceCents) * 100);
}

/**
 * Check if a product is in stock
 * @param inStock - Boolean from product.inStock
 */
export function isInStock(inStock?: boolean | null): boolean {
  return inStock === true;
}

/**
 * Get the primary image URL from a product's images array
 * @param images - Array of product images
 * @returns URL of the primary image, or the first image, or null
 */
export function getPrimaryImage(
  images?: { url: string; isPrimary: boolean }[]
): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((img) => img.isPrimary);
  return primary?.url ?? images[0]?.url ?? null;
}

/**
 * Format an E.164 phone number for display using the supported COUNTRIES list.
 * Grouping comes from the country's `localPlaceholder` (e.g., "9XX XXX XXXX").
 *
 * @param options.withFlag - Show flag emoji instead of the dial code (default: true)
 *
 * Examples (withFlag=true):
 *   "+593969499830" → "🇪🇨 96 949 9830"
 * Examples (withFlag=false):
 *   "+593969499830" → "+593 96 949 9830"
 *
 * Unknown prefix / malformed input is returned as-is.
 */
export function formatPhone(
  phone?: string | null,
  options: { withFlag?: boolean } = {}
): string {
  const { withFlag = true } = options;
  if (!phone) return "";
  const trimmed = phone.trim();
  if (!trimmed) return "";

  const country = findCountryByDialCode(trimmed);
  if (!country) return trimmed;

  const local = trimmed.slice(country.dialCode.length).replace(/\D/g, "");
  const prefix = withFlag ? country.flag : country.dialCode;
  if (!local) return prefix;

  const groupSizes = country.localPlaceholder.split(" ").map((g) => g.length);
  const groups: string[] = [];
  let pos = 0;
  for (const size of groupSizes) {
    if (pos >= local.length) break;
    groups.push(local.slice(pos, pos + size));
    pos += size;
  }
  if (pos < local.length) groups.push(local.slice(pos));

  return `${prefix} ${groups.filter(Boolean).join(" ")}`;
}
