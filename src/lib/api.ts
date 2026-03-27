const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type QueryParams = Record<string, string | number | boolean | undefined>;

type FetchOptions = RequestInit & {
  params?: QueryParams;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, data);
  }

  const text = await response.text();
  if (!text) return null as T;
  return JSON.parse(text);
}

// Types

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  result: T[];
  meta: PaginationMeta;
}

// Wrapper for non-paginated responses
export interface ResultResponse<T> {
  result: T;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  rootOnly?: boolean;
  parentId?: string;
}

// Product
export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  comparePriceCents: number | null;
  sku: string | null;
  categoryId: string | null;
  branchId: string | null;
  includesCard: boolean;
  cardMessageFeeCents: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isQuickDelivery: boolean;
  preparationMinutes: number;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category?: Category;
  // Computed fields
  inStock: boolean;
  availableQuantity: number | null;
  hasRecipe: boolean;
  materialCostCents: number | null;
  displayPriceCents: number;
  transferPriceCents: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isQuickDelivery?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Instagram Types
export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramPost {
  id: string;
  mediaType: InstagramMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  permalink: string;
  timestamp: string;
}

export interface InstagramFeedMeta {
  total: number;
  cachedAt: string;
  expiresAt: string;
}

export interface InstagramFeedResponse {
  result: InstagramPost[];
  meta: InstagramFeedMeta;
}

export interface InstagramFeedFilters {
  limit?: number;
}

// Auth Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: {
    id: string;
    code: string;
    name: string;
    resource: string;
    action: string;
    description: string;
  }[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

// City
export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Branch
export interface Branch {
  id: string;
  cityId: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  cityName?: string;
  cityState?: string;
}

// GeoJSON Polygon
export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

// Delivery Zone
export interface DeliveryZone {
  id: string;
  branchId: string;
  zoneName: string;
  polygon: GeoPolygon | null;
  deliveryFeeCents: number;
  estimatedMinutes: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Delivery Time Slot
export interface DeliveryTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayLabel: string | null;
  displayOrder: number;
  maxOrdersPerSlot: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Special Date
export interface SpecialDate {
  id: string;
  date: string;
  name: string;
  warningMessage: string | null;
  orderLimitOverride: number | null;
  requiresAdvanceDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialDateFilters {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

// Bank Account
export interface BankAccount {
  id: string;
  bankName: string;
  accountType: "savings" | "checking";
  accountNumber: string;
  beneficiary: string;
  documentType: "cedula" | "ruc";
  documentNumber: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Occasion
export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add-On Category
export interface AddOnCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Add-On
export interface AddOn {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  priceCents: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Product Add-Ons (grouped by category)
export interface ProductAddOnItem {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl: string;
  displayOrder: number;
}

export interface ProductAddOnsGroup {
  category: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
  addOns: ProductAddOnItem[];
}

// Order Settings
export interface OrderSettings {
  id: string;
  transferDiscountPercentage: number;
  dailyOrderLimit: number | null;
  orderExpirationHours: number;
  guestTokenExpirationHours: number;
  bouquetAssemblyFeeCents: number;
  bouquetMinFlowers: number | null;
  bouquetMaxFlowers: number | null;
  bouquetBuilderEnabled: boolean;
  bouquetDefaultPrepMinutes: number;
  bouquetIncludesCard: boolean;
  bouquetCardMessageFeeCents: number | null;
  minAdvanceDays: number;
  updatedAt: string;
  updatedBy: string | null;
}

// Delivery Settings
export interface DeliverySettings {
  id: string;
  baseFeeCents: number;
  pricePerKmCents: number;
  averageSpeedKmh: number;
  maxDeliveryDistanceKm: string | null;
  minOrderCentsForFreeDelivery: number | null;
  updatedAt: string;
  updatedBy: string | null;
}

// Order Types
export type FulfillmentType = "delivery" | "pickup";
export type PaymentMethod = "bank_transfer" | "paypal" | "datafast";
export type OrderStatus = "pending_payment" | "paid" | "preparing" | "delivery_assigned" | "out_for_delivery" | "delivered" | "ready_for_pickup" | "picked_up" | "cancelled";
export type PaymentStatus = "pending" | "awaiting_verification" | "paid" | "cancelled";

export interface OrderItemAddOnRequest {
  addOnId: string;
  quantity?: number;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
  cardMessage?: string;
  addOns?: OrderItemAddOnRequest[];
}

export interface CreateOrderRequest {
  fulfillmentType: FulfillmentType;
  branchId: string;
  deliveryZoneId?: string;
  latitude?: number;
  longitude?: number;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  paymentMethod: PaymentMethod;
  items: OrderItemRequest[];
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryReference?: string;
  occasionId?: string;
  isSurprise?: boolean;
  isAnonymous?: boolean;
  discountCode?: string;
}

export interface PreviewOrderRequest {
  fulfillmentType: FulfillmentType;
  branchId: string;
  deliveryZoneId?: string;
  latitude?: number;
  longitude?: number;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  paymentMethod: PaymentMethod;
  items: OrderItemRequest[];
  discountCode?: string;
}

export interface ValidateDiscountCodeRequest {
  code: string;
  subtotalCents: number;
  paymentMethod: PaymentMethod;
}

export interface ValidateDiscountCodeResult {
  discountCodeId: string;
  discountAmountCents: number;
  type: "percentage" | "fixed_amount";
  value: number;
}

export interface ValidateDiscountCodeResponse {
  result: ValidateDiscountCodeResult;
}

export interface PreviewItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  cardMessageFeeCents: number;
  addOns: {
    addOnId: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
}

export interface TimeEstimate {
  queueWaitMinutes: number;
  preparationMinutes: number;
  travelMinutes: number;
  totalEstimatedMinutes: number;
}

export interface OrderPreview {
  items: PreviewItemResponse[];
  subtotalCents: number;
  addOnsTotalCents: number;
  cardMessageTotalCents: number;
  deliveryFeeCents: number;
  transferDiscountCents: number;
  discountAmountCents: number;
  taxCents: number;
  totalCents: number;
  timeEstimate: TimeEstimate;
  warningMessage?: string;
  isPreview: boolean;
}

export interface OrderItemAddOnResponse {
  id: string;
  addOnId: string;
  quantity: number;
  priceCentsSnapshot: number;
  addOnNameSnapshot: string;
  imageUrl: string | null;
  lineTotalCents: number;
}

export interface OrderItemResponse {
  id: string;
  productId: string | null;
  customBouquetId: string | null;
  quantity: number;
  priceAtPurchaseCents: number;
  productNameSnapshot: string;
  primaryImageUrl: string | null;
  preparationMinutesSnapshot: number;
  cardMessage: string | null;
  cardMessageFeeCents: number;
  lineTotalCents: number;
  addOns: OrderItemAddOnResponse[];
}

export interface DeliveryVehicleSnapshot {
  vehicleType: "motorcycle" | "car";
  brand: string;
  model: string;
  year: number | null;
  color: string;
  licensePlate: string;
  imageUrl: string | null;
}

export interface DeliveryPerson {
  id: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  vehicle: DeliveryVehicleSnapshot | null;
}

export interface OrderDeliveryZone {
  id: string;
  zoneName: string;
}

export interface OrderDeliveryTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayLabel: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  branchId: string;
  fulfillmentType: FulfillmentType;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryZoneId: string | null;
  deliveryReference: string | null;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  occasionId: string | null;
  isSurprise: boolean;
  isAnonymous: boolean;
  subtotalCents: number;
  addOnsTotalCents: number;
  cardMessageTotalCents: number;
  deliveryFeeCents: number;
  transferDiscountCents: number;
  discountCodeId: string | null;
  discountAmountCents: number;
  taxCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transferProofUrl: string | null;
  transferReference: string | null;
  transferVerifiedAt: string | null;
  transferRejectionReason: string | null;
  orderStatus: OrderStatus;
  estimatedPrepMinutes: number;
  preparationOverrideMinutes: number | null;
  overrideReason: string | null;
  preparationStartedAt: string | null;
  preparationCompletedAt: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  guestToken?: string;
  // Detail-only fields (not present in list endpoints)
  deliveryZone?: OrderDeliveryZone | null;
  deliveryTimeSlot?: OrderDeliveryTimeSlot | null;
  deliveryPerson?: DeliveryPerson | null;
  deliveryVehicleSnapshot?: unknown;
}

// For list endpoints (GET /orders/my) - no nested relations
export type OrderListItem = Omit<Order, "items" | "deliveryZone" | "deliveryTimeSlot" | "deliveryPerson" | "deliveryVehicleSnapshot">;

export interface OrderFilters {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentType?: FulfillmentType;
}

// Delivery Address (API)
export interface DeliveryAddressApi {
  id: string;
  userId: string;
  nickname: string | null;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  zoneId: string | null;
  reference: string | null;
  latitude: string;
  longitude: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeliveryAddressRequest {
  nickname?: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  zoneId?: string;
  reference?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export interface UpdateDeliveryAddressRequest {
  nickname?: string;
  recipientName?: string;
  recipientPhone?: string;
  address?: string;
  city?: string;
  zoneId?: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Helper to get auth header
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};

  // First try the dedicated tokens storage
  const tokens = localStorage.getItem("encanto-tokens");
  if (tokens) {
    try {
      const { accessToken } = JSON.parse(tokens);
      if (accessToken) {
        return { Authorization: `Bearer ${accessToken}` };
      }
    } catch {
      // Continue to try zustand store
    }
  }

  // Fallback: try the zustand persist store
  const authStore = localStorage.getItem("encanto-auth");
  if (authStore) {
    try {
      const parsed = JSON.parse(authStore);
      const accessToken = parsed?.state?.tokens?.accessToken;
      if (accessToken) {
        return { Authorization: `Bearer ${accessToken}` };
      }
    } catch {
      // No valid token found
    }
  }

  return {};
}

// Helper to get guest token header
function getGuestTokenHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("encanto-guest-token");
  if (token) {
    return { "X-Guest-Token": token };
  }
  return {};
}

// Authenticated fetch (client-side, reads from localStorage)
async function fetchApiAuth<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const authHeader = getAuthHeader();
  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      ...authHeader,
      ...options.headers,
    },
  });
}

// Authenticated fetch with explicit token (for Server Actions)
async function fetchApiWithToken<T>(
  endpoint: string,
  accessToken: string,
  options: FetchOptions = {}
): Promise<T> {
  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
}

// Fetch with explicit auth + guest tokens (for Server Actions)
async function fetchApiWithTokens<T>(
  endpoint: string,
  options: FetchOptions = {},
  accessToken?: string,
  guestToken?: string
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (guestToken) headers["X-Guest-Token"] = guestToken;
  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}

// API Functions
export const api = {
  // Auth
  auth: {
    signUp: (data: SignUpRequest) =>
      fetchApi<{ message: string }>("/auth/sign-up", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    signIn: (data: SignInRequest) =>
      fetchApi<AuthTokens>("/auth/sign-in", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    refreshToken: (refreshToken: string) =>
      fetchApi<AuthTokens>("/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }),

    me: () => fetchApiAuth<ResultResponse<UserProfile>>("/users/me").then(r => r.result),

    verifyEmail: (token: string) =>
      fetchApi<{ message: string }>("/auth/verify-email", {
        params: { token },
      }),

    resendVerification: () =>
      fetchApiAuth<{ message: string }>("/auth/resend-verification", {
        method: "POST",
      }),

    uploadAvatar: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const authHeader = getAuthHeader();
      const response = await fetch(`${API_URL}/users/me/avatar`, {
        method: "POST",
        headers: authHeader,
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, data);
      }

      const json = await response.json() as { result: { avatarUrl: string } };
      return json.result;
    },

    deleteAvatar: () =>
      fetchApiAuth<void>("/users/me/avatar", {
        method: "DELETE",
      }),

    uploadAvatarWithToken: async (formData: FormData, accessToken: string): Promise<{ avatarUrl: string }> => {
      const response = await fetch(`${API_URL}/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = (data as { message?: string })?.message || "Error al subir la imagen";
        throw new Error(message);
      }

      const json = await response.json() as { result: { avatarUrl: string } };
      return json.result;
    },

    deleteAvatarWithToken: (accessToken: string) =>
      fetchApiWithToken<void>("/users/me/avatar", accessToken, {
        method: "DELETE",
      }),

    changePassword: (data: ChangePasswordRequest) =>
      fetchApiAuth<{ message: string }>("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    // Server Action variants (explicit token)
    meWithToken: (accessToken: string) =>
      fetchApiWithToken<ResultResponse<UserProfile>>("/users/me", accessToken).then(r => r.result),

    resendVerificationWithToken: (accessToken: string) =>
      fetchApiWithToken<{ message: string }>("/users/me/resend-verification", accessToken, {
        method: "POST",
      }),

    changePasswordWithToken: (data: ChangePasswordRequest, accessToken: string) =>
      fetchApiWithToken<{ message: string }>("/users/me/password", accessToken, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Categories
  categories: {
    list: (filters?: CategoryFilters) =>
      fetchApi<PaginatedResponse<Category>>("/categories", {
        params: filters as QueryParams,
      }),

    getById: (id: string) =>
      fetchApi<ResultResponse<Category & { children: Category[] }>>(`/categories/${id}`).then(r => r.result),

    getBySlug: (slug: string) =>
      fetchApi<ResultResponse<Category & { children: Category[] }>>(`/categories/slug/${slug}`).then(r => r.result),
  },

  // Products
  products: {
    list: (filters?: ProductFilters) =>
      fetchApi<PaginatedResponse<Product>>("/products", {
        params: filters as QueryParams,
      }),

    getById: (id: string) => fetchApi<ResultResponse<Product>>(`/products/${id}`).then(r => r.result),

    getBySlug: (slug: string) => fetchApi<ResultResponse<Product>>(`/products/slug/${slug}`).then(r => r.result),

    featured: (limit = 8) =>
      fetchApi<PaginatedResponse<Product>>("/products", {
        params: { isFeatured: true, isActive: true, limit },
      }),

    byCategory: (
      categoryId: string,
      filters?: Omit<ProductFilters, "categoryId">
    ) =>
      fetchApi<PaginatedResponse<Product>>("/products", {
        params: { ...filters, categoryId, isActive: true } as QueryParams,
      }),

    addOns: (productId: string) =>
      fetchApi<ResultResponse<ProductAddOnsGroup[]>>(`/products/${productId}/add-ons`).then(r => r.result),
  },

  // Instagram
  instagram: {
    feed: (filters?: InstagramFeedFilters | number) => {
      const params = typeof filters === "number" ? { limit: filters } : filters;
      return fetchApi<InstagramFeedResponse>("/instagram/feed", {
        params: params as QueryParams,
      });
    },
  },

  // Cities
  cities: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<City>>("/cities", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<ResultResponse<City[]>>("/cities/active").then(r => r.result),

    getById: (id: string) => fetchApi<City>(`/cities/${id}`),
  },

  // Branches
  branches: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<Branch>>("/branches", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<ResultResponse<Branch[]>>("/branches/active").then(r => r.result),

    byCity: (cityId: string) => fetchApi<ResultResponse<Branch[]>>(`/branches/city/${cityId}`).then(r => r.result),

    getById: (id: string) => fetchApi<Branch>(`/branches/${id}`),
  },

  // Delivery Zones
  deliveryZones: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<DeliveryZone>>("/delivery-zones", {
        params: filters as QueryParams,
      }),

    byBranch: (branchId: string) =>
      fetchApi<ResultResponse<DeliveryZone[]>>(`/delivery-zones/branch/${branchId}`).then(r => r.result),

    contains: (lat: number, lng: number) =>
      fetchApi<ResultResponse<DeliveryZone | null>>("/delivery-zones/contains", {
        params: { lat, lng },
      }).then(r => r.result),

    getById: (id: string) => fetchApi<ResultResponse<DeliveryZone>>(`/delivery-zones/${id}`).then(r => r.result),
  },

  // Delivery Time Slots
  timeSlots: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<DeliveryTimeSlot>>("/delivery-time-slots", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<ResultResponse<DeliveryTimeSlot[]>>("/delivery-time-slots/active").then(r => r.result),

    getById: (id: string) => fetchApi<DeliveryTimeSlot>(`/delivery-time-slots/${id}`),
  },

  // Special Dates
  specialDates: {
    list: (filters?: SpecialDateFilters) =>
      fetchApi<PaginatedResponse<SpecialDate>>("/special-dates", {
        params: filters as QueryParams,
      }),

    getById: (id: string) => fetchApi<SpecialDate>(`/special-dates/${id}`),
  },

  // Bank Accounts
  bankAccounts: {
    active: () => fetchApi<ResultResponse<BankAccount[]>>("/bank-accounts/active").then(r => r.result),
  },

  // Occasions
  occasions: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<Occasion>>("/occasions", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<ResultResponse<Occasion[]>>("/occasions/active").then(r => r.result),

    getById: (id: string) => fetchApi<Occasion>(`/occasions/${id}`),
  },

  // Add-On Categories
  addOnCategories: {
    active: () => fetchApi<ResultResponse<AddOnCategory[]>>("/add-on-categories").then(r => r.result),

    getById: (id: string) => fetchApi<AddOnCategory>(`/add-on-categories/${id}`),
  },

  // Add-Ons
  addOns: {
    list: (categoryId?: string) =>
      fetchApi<ResultResponse<AddOn[]>>("/add-ons", {
        params: categoryId ? { categoryId } : undefined,
      }).then(r => r.result),

    getById: (id: string) => fetchApi<AddOn>(`/add-ons/${id}`),
  },

  // Order Settings
  orderSettings: {
    get: () => fetchApi<ResultResponse<OrderSettings>>("/order-settings").then(r => r.result),
  },

  // Delivery Settings
  deliverySettings: {
    get: () => fetchApi<ResultResponse<DeliverySettings>>("/delivery-settings").then(r => r.result),
  },

  // Orders
  orders: {
    create: (data: CreateOrderRequest) =>
      fetchApi<ResultResponse<Order>>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          ...getAuthHeader(),
          ...getGuestTokenHeader(),
        },
      }).then(r => r.result),

    preview: (data: PreviewOrderRequest) =>
      fetchApi<ResultResponse<OrderPreview>>("/orders/preview", {
        method: "POST",
        body: JSON.stringify(data),
      }).then(r => r.result),

    estimateTime: (data: { branchId: string; items: OrderItemRequest[] }) =>
      fetchApi<ResultResponse<{ estimatedPrepMinutes: number }>>("/orders/estimate-time", {
        method: "POST",
        body: JSON.stringify(data),
      }).then(r => r.result),

    my: (filters?: OrderFilters) =>
      fetchApiAuth<PaginatedResponse<OrderListItem>>("/orders/my", {
        params: filters as QueryParams,
      }),

    getByOrderNumber: (orderNumber: string) => {
      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      return fetchApi<ResultResponse<Order>>(`/orders/${orderNumber}`, {
        headers: { ...authHeader, ...guestHeader },
      }).then(r => r.result);
    },

    cancel: (id: string) => {
      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      return fetchApi<ResultResponse<Order>>(`/orders/${id}/cancel`, {
        method: "POST",
        headers: { ...authHeader, ...guestHeader },
      }).then(r => r.result);
    },

    uploadTransferProof: async (id: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      const response = await fetch(`${API_URL}/orders/${id}/transfer-proof`, {
        method: "POST",
        headers: { ...authHeader, ...guestHeader },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiError(response.status, response.statusText, data);
      }

      const json = await response.json() as { result: Order };
      return json.result;
    },

    uploadTransferProofWithTokens: async (
      id: string,
      formData: FormData,
      accessToken?: string,
      guestToken?: string
    ): Promise<Order> => {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (guestToken) headers["X-Guest-Token"] = guestToken;

      const response = await fetch(`${API_URL}/orders/${id}/transfer-proof`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = (data as { message?: string })?.message || "Error al subir el comprobante";
        throw new Error(message);
      }

      const json = await response.json() as { result: Order };
      return json.result;
    },

    claimGuestOrders: () =>
      fetchApiAuth<ResultResponse<{ claimedCount: number }>>("/orders/claim-guest-orders", {
        method: "POST",
      }).then(r => r.result),

    queueStatus: (branchId: string) =>
      fetchApi<ResultResponse<{ ordersInQueue: number; estimatedWaitMinutes: number }>>(
        `/orders/branch/${branchId}/queue-status`
      ).then(r => r.result),

    // Server Action variants (explicit tokens)
    createWithTokens: (data: CreateOrderRequest, accessToken?: string, guestToken?: string) =>
      fetchApiWithTokens<ResultResponse<Order>>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }, accessToken, guestToken).then(r => r.result),

    myWithToken: (filters: OrderFilters, accessToken: string) =>
      fetchApiWithToken<PaginatedResponse<OrderListItem>>("/orders/my", accessToken, {
        params: filters as QueryParams,
      }),

    getByOrderNumberWithTokens: (orderNumber: string, accessToken?: string, guestToken?: string) =>
      fetchApiWithTokens<ResultResponse<Order>>(`/orders/${orderNumber}`, {}, accessToken, guestToken).then(r => r.result),

    cancelWithTokens: (id: string, accessToken?: string, guestToken?: string) =>
      fetchApiWithTokens<ResultResponse<Order>>(`/orders/${id}/cancel`, {
        method: "POST",
      }, accessToken, guestToken).then(r => r.result),

    claimGuestOrdersWithToken: (accessToken: string) =>
      fetchApiWithToken<ResultResponse<{ claimedCount: number }>>("/orders/claim-guest-orders", accessToken, {
        method: "POST",
      }).then(r => r.result),

    // PayPal
    paypalCreateOrder: (orderId: string) => {
      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      return fetchApi<ResultResponse<{ paypalOrderId: string }>>(`/orders/${orderId}/paypal/create-order`, {
        method: "POST",
        headers: { ...authHeader, ...guestHeader },
      }).then(r => r.result);
    },

    paypalCapture: (orderId: string) => {
      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      return fetchApi<ResultResponse<Order>>(`/orders/${orderId}/paypal/capture`, {
        method: "POST",
        headers: { ...authHeader, ...guestHeader },
      }).then(r => r.result);
    },

    paypalCreateOrderWithTokens: (orderId: string, accessToken?: string, guestToken?: string) =>
      fetchApiWithTokens<ResultResponse<{ paypalOrderId: string }>>(`/orders/${orderId}/paypal/create-order`, {
        method: "POST",
      }, accessToken, guestToken).then(r => r.result),

    paypalCaptureWithTokens: (orderId: string, accessToken?: string, guestToken?: string) =>
      fetchApiWithTokens<ResultResponse<Order>>(`/orders/${orderId}/paypal/capture`, {
        method: "POST",
      }, accessToken, guestToken).then(r => r.result),
  },

  // Discount Codes
  discountCodes: {
    validate: (data: ValidateDiscountCodeRequest) =>
      fetchApi<ValidateDiscountCodeResponse>("/discount-codes/validate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Delivery Addresses
  deliveryAddresses: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApiAuth<PaginatedResponse<DeliveryAddressApi>>("/delivery-addresses", {
        params: filters as QueryParams,
      }),

    getDefault: () =>
      fetchApiAuth<ResultResponse<DeliveryAddressApi | null>>("/delivery-addresses/default").then(r => r.result),

    getById: (id: string) =>
      fetchApiAuth<ResultResponse<DeliveryAddressApi>>(`/delivery-addresses/${id}`).then(r => r.result),

    create: (data: CreateDeliveryAddressRequest) =>
      fetchApiAuth<ResultResponse<DeliveryAddressApi>>("/delivery-addresses", {
        method: "POST",
        body: JSON.stringify(data),
      }).then(r => r.result),

    update: (id: string, data: UpdateDeliveryAddressRequest) =>
      fetchApiAuth<ResultResponse<DeliveryAddressApi>>(`/delivery-addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }).then(r => r.result),

    delete: (id: string) =>
      fetchApiAuth<void>(`/delivery-addresses/${id}`, {
        method: "DELETE",
      }),

    setDefault: (id: string) =>
      fetchApiAuth<ResultResponse<DeliveryAddressApi>>(`/delivery-addresses/${id}/default`, {
        method: "PATCH",
      }).then(r => r.result),

    // Server Action variants (explicit token)
    listWithToken: (accessToken: string, filters?: { page?: number; limit?: number }) =>
      fetchApiWithToken<PaginatedResponse<DeliveryAddressApi>>("/delivery-addresses", accessToken, {
        params: filters as QueryParams,
      }),

    createWithToken: (data: CreateDeliveryAddressRequest, accessToken: string) =>
      fetchApiWithToken<ResultResponse<DeliveryAddressApi>>("/delivery-addresses", accessToken, {
        method: "POST",
        body: JSON.stringify(data),
      }).then(r => r.result),
  },
};

export { ApiError };
