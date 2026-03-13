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

  return response.json();
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

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
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
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  inventory: Inventory | null;
  category?: Category;
  stock?: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
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

// Delivery Zone
export interface DeliveryZone {
  id: string;
  branchId: string;
  zoneName: string;
  polygon: unknown | null;
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
export type PaymentMethod = "bank_transfer" | "paypal" | "datafast";
export type OrderStatus = "pending_payment" | "paid" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
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
  branchId: string;
  deliveryZoneId: string;
  latitude: number;
  longitude: number;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  paymentMethod: PaymentMethod;
  items: OrderItemRequest[];
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryReference?: string;
  occasionId?: string;
  isSurprise?: boolean;
}

export interface PreviewOrderRequest {
  branchId: string;
  deliveryZoneId: string;
  latitude: number;
  longitude: number;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  paymentMethod: PaymentMethod;
  items: OrderItemRequest[];
}

export interface PreviewItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  addOns?: {
    addOnId: string;
    addOnName: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }[];
}

export interface OrderPreview {
  items: PreviewItemResponse[];
  subtotalCents: number;
  addOnsTotalCents: number;
  cardMessageTotalCents: number;
  deliveryFeeCents: number;
  transferDiscountCents: number;
  totalCents: number;
  estimatedPrepMinutes: number;
  warningMessage?: string;
  isPreview: boolean;
}

export interface OrderItemAddOnResponse {
  id: string;
  addOnId: string;
  quantity: number;
  priceCentsSnapshot: number;
  addOnNameSnapshot: string;
  lineTotalCents: number;
}

export interface OrderItemResponse {
  id: string;
  productId: string | null;
  customBouquetId: string | null;
  quantity: number;
  priceAtPurchaseCents: number;
  productNameSnapshot: string;
  preparationMinutesSnapshot: number;
  cardMessage: string | null;
  cardMessageFeeCents: number;
  lineTotalCents: number;
  addOns: OrderItemAddOnResponse[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  branchId: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryZoneId: string;
  deliveryReference: string | null;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  occasionId: string | null;
  isSurprise: boolean;
  subtotalCents: number;
  addOnsTotalCents: number;
  cardMessageTotalCents: number;
  deliveryFeeCents: number;
  transferDiscountCents: number;
  totalCents: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transferProofUrl: string | null;
  transferReference: string | null;
  transferVerifiedAt: string | null;
  orderStatus: OrderStatus;
  estimatedPrepMinutes: number;
  preparationOverrideMinutes: number | null;
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
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
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

// Authenticated fetch
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

    me: () => fetchApiAuth<UserProfile>("/users/me"),

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

      return response.json() as Promise<{ avatarUrl: string }>;
    },

    deleteAvatar: () =>
      fetchApiAuth<void>("/users/me/avatar", {
        method: "DELETE",
      }),

    changePassword: (data: ChangePasswordRequest) =>
      fetchApiAuth<{ message: string }>("/users/me/password", {
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
      fetchApi<Category & { children: Category[] }>(`/categories/${id}`),

    getBySlug: (slug: string) =>
      fetchApi<Category & { children: Category[] }>(`/categories/slug/${slug}`),
  },

  // Products
  products: {
    list: (filters?: ProductFilters) =>
      fetchApi<PaginatedResponse<Product>>("/products", {
        params: filters as QueryParams,
      }),

    getById: (id: string) => fetchApi<Product>(`/products/${id}`),

    getBySlug: (slug: string) => fetchApi<Product>(`/products/slug/${slug}`),

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

    active: () => fetchApi<City[]>("/cities/active"),

    getById: (id: string) => fetchApi<City>(`/cities/${id}`),
  },

  // Branches
  branches: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<Branch>>("/branches", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<Branch[]>("/branches/active"),

    byCity: (cityId: string) => fetchApi<Branch[]>(`/branches/city/${cityId}`),

    getById: (id: string) => fetchApi<Branch>(`/branches/${id}`),
  },

  // Delivery Zones
  deliveryZones: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<DeliveryZone>>("/delivery-zones", {
        params: filters as QueryParams,
      }),

    byBranch: (branchId: string) =>
      fetchApi<DeliveryZone[]>(`/delivery-zones/branch/${branchId}`),

    contains: (lat: number, lng: number) =>
      fetchApi<DeliveryZone | null>("/delivery-zones/contains", {
        params: { lat, lng },
      }),

    getById: (id: string) => fetchApi<DeliveryZone>(`/delivery-zones/${id}`),
  },

  // Delivery Time Slots
  timeSlots: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<DeliveryTimeSlot>>("/delivery-time-slots", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<DeliveryTimeSlot[]>("/delivery-time-slots/active"),

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
    active: () => fetchApi<BankAccount[]>("/bank-accounts/active"),
  },

  // Occasions
  occasions: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApi<PaginatedResponse<Occasion>>("/occasions", {
        params: filters as QueryParams,
      }),

    active: () => fetchApi<Occasion[]>("/occasions/active"),

    getById: (id: string) => fetchApi<Occasion>(`/occasions/${id}`),
  },

  // Add-On Categories
  addOnCategories: {
    active: () => fetchApi<AddOnCategory[]>("/add-on-categories"),

    getById: (id: string) => fetchApi<AddOnCategory>(`/add-on-categories/${id}`),
  },

  // Add-Ons
  addOns: {
    list: (categoryId?: string) =>
      fetchApi<AddOn[]>("/add-ons", {
        params: categoryId ? { categoryId } : undefined,
      }),

    getById: (id: string) => fetchApi<AddOn>(`/add-ons/${id}`),
  },

  // Order Settings
  orderSettings: {
    get: () => fetchApi<OrderSettings>("/order-settings"),
  },

  // Delivery Settings
  deliverySettings: {
    get: () => fetchApi<DeliverySettings>("/delivery-settings"),
  },

  // Orders
  orders: {
    create: (data: CreateOrderRequest) =>
      fetchApi<Order>("/orders", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          ...getAuthHeader(),
          ...getGuestTokenHeader(),
        },
      }),

    preview: (data: PreviewOrderRequest) =>
      fetchApi<OrderPreview>("/orders/preview", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    estimateTime: (data: { branchId: string; items: OrderItemRequest[] }) =>
      fetchApi<{ estimatedPrepMinutes: number }>("/orders/estimate-time", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    my: (filters?: OrderFilters) =>
      fetchApiAuth<PaginatedResponse<Order>>("/orders/my", {
        params: filters as QueryParams,
      }),

    getById: (id: string) => {
      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      return fetchApi<Order>(`/orders/${id}`, {
        headers: { ...authHeader, ...guestHeader },
      });
    },

    cancel: (id: string) => {
      const authHeader = getAuthHeader();
      const guestHeader = getGuestTokenHeader();
      return fetchApi<Order>(`/orders/${id}/cancel`, {
        method: "POST",
        headers: { ...authHeader, ...guestHeader },
      });
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

      return response.json() as Promise<Order>;
    },

    claimGuestOrders: () =>
      fetchApiAuth<{ claimedCount: number }>("/orders/claim-guest-orders", {
        method: "POST",
      }),

    queueStatus: (branchId: string) =>
      fetchApi<{ pendingOrders: number; estimatedWaitMinutes: number }>(
        `/orders/branch/${branchId}/queue-status`
      ),
  },

  // Delivery Addresses
  deliveryAddresses: {
    list: (filters?: { page?: number; limit?: number }) =>
      fetchApiAuth<PaginatedResponse<DeliveryAddressApi>>("/delivery-addresses", {
        params: filters as QueryParams,
      }),

    getDefault: () =>
      fetchApiAuth<DeliveryAddressApi>("/delivery-addresses/default"),

    getById: (id: string) =>
      fetchApiAuth<DeliveryAddressApi>(`/delivery-addresses/${id}`),

    create: (data: CreateDeliveryAddressRequest) =>
      fetchApiAuth<DeliveryAddressApi>("/delivery-addresses", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateDeliveryAddressRequest) =>
      fetchApiAuth<DeliveryAddressApi>(`/delivery-addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApiAuth<void>(`/delivery-addresses/${id}`, {
        method: "DELETE",
      }),

    setDefault: (id: string) =>
      fetchApiAuth<DeliveryAddressApi>(`/delivery-addresses/${id}/default`, {
        method: "PATCH",
      }),
  },
};

export { ApiError };
