const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
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
export interface PaginatedResponse<T> {
  result: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
}

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
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  inventory: {
    quantity: number;
    lowStockThreshold: number;
  } | null;
  category?: Category;
}

// API Functions
export const api = {
  // Categories
  categories: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      rootOnly?: boolean;
      parentId?: string;
    }) =>
      fetchApi<PaginatedResponse<Category>>("/categories", { params }),

    getById: (id: string) => fetchApi<Category>(`/categories/${id}`),

    getBySlug: (slug: string) => fetchApi<Category>(`/categories/slug/${slug}`),
  },

  // Products
  products: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      isActive?: boolean;
      isFeatured?: boolean;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
    }) =>
      fetchApi<PaginatedResponse<Product>>("/products", { params }),

    getById: (id: string) => fetchApi<Product>(`/products/${id}`),

    getBySlug: (slug: string) => fetchApi<Product>(`/products/slug/${slug}`),

    featured: (limit = 8) =>
      fetchApi<PaginatedResponse<Product>>("/products", {
        params: { isFeatured: true, isActive: true, limit },
      }),
  },
};

export { ApiError };
