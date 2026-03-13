"use server";

import { api } from "@/lib/api";
import type { Product, PaginatedResponse, ProductFilters } from "@/lib/api";

export async function searchProductsAction(
  filters: ProductFilters
): Promise<PaginatedResponse<Product>> {
  return api.products.list(filters);
}
