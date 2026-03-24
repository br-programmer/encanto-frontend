"use server";

import { api } from "@/lib/api";
import type { Product, PaginatedResponse, ProductFilters } from "@/lib/api";

export async function searchProductsAction(
  filters: ProductFilters
): Promise<PaginatedResponse<Product>> {
  const result = await api.products.list(filters);
  console.log("[searchProductsAction] filters:", JSON.stringify(filters), "total:", result.meta.total, "products:", result.result.map(p => ({ id: p.id, name: p.name, slug: p.slug })));
  return result;
}
