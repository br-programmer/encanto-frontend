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

// Helper to get auth header
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};

  // First try the dedicated tokens storage
  let tokens = localStorage.getItem("encanto-tokens");
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

// Instagram
export interface InstagramPost {
  id: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  permalink: string;
  timestamp: string;
}

export interface InstagramFeedResponse {
  result: InstagramPost[];
  meta: {
    total: number;
    cachedAt: string;
    expiresAt: string;
  };
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
    feed: (filters?: InstagramFeedFilters) =>
      fetchApi<InstagramFeedResponse>("/instagram/feed", {
        params: filters as QueryParams,
      }),
  },
};

export { ApiError };
