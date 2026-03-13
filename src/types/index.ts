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
  // Instagram
  InstagramPost,
  InstagramMediaType,
  InstagramFeedResponse,
  InstagramFeedMeta,
  InstagramFeedFilters,
  // Auth
  AuthTokens,
  UserProfile,
  UserRole,
  // Cities & Delivery
  City,
  Branch,
  DeliveryZone,
  DeliveryTimeSlot,
  SpecialDate,
  BankAccount,
  Occasion,
  AddOn,
  AddOnCategory,
  OrderSettings,
  DeliverySettings,
  // Orders
  Order,
  OrderItemResponse,
  OrderItemAddOnResponse,
  OrderPreview,
  PreviewItemResponse,
  CreateOrderRequest,
  PreviewOrderRequest,
  OrderItemRequest,
  OrderItemAddOnRequest,
  OrderFilters,
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
  // Delivery Addresses
  DeliveryAddressApi,
  CreateDeliveryAddressRequest,
  UpdateDeliveryAddressRequest,
} from "@/lib/api";

// Cart types
export interface CartItemAddOn {
  addOnId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    image: string | null;
  };
  quantity: number;
  cardMessage?: string;
  addOns?: CartItemAddOn[];
}
