// Re-export API types
export type {
  Category,
  Product,
  ProductImage,
  PaginatedResponse,
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
