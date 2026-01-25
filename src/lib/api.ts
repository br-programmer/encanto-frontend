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

// API Functions
export const api = {
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
};

export { ApiError };
