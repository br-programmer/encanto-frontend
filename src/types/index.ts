// Re-export API types
export type {
  // Core types
  Category,
  Product,
  ProductImage,
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
  ProductAddOnItem,
  ProductAddOnsGroup,
  OrderSettings,
  DeliverySettings,
  // Orders
  Order,
  OrderListItem,
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
  ValidateDiscountCodeRequest,
  ValidateDiscountCodeResponse,
  DeliveryPerson,
  DeliveryVehicleSnapshot,
  OrderDeliveryZone,
  OrderDeliveryTimeSlot,
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
  imageUrl?: string;
  quantity: number;
}

export interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    priceCents: number;
    image: string | null;
    isQuickDelivery?: boolean;
  };
  quantity: number;
  cardMessage?: string;
  addOns?: CartItemAddOn[];
}
