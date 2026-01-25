// Re-export API types
export type {
  // Core types
  Category,
  Product,
  ProductImage,
  Inventory,
  // Pagination
  PaginatedResponse,
  PaginationMeta,
  // Filters
  CategoryFilters,
  ProductFilters,
} from "@/lib/api";

// Cart types
export interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    image: string | null;
  };
  quantity: number;
}
