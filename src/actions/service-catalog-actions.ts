"use server";

import { api } from "@/lib/api";
import type { ServiceCatalog } from "@/lib/api";

export async function getServicesAction(): Promise<ServiceCatalog[]> {
  const response = await api.serviceCatalog.list();
  return response.result;
}

export async function getFeaturedServicesAction(): Promise<ServiceCatalog[]> {
  const response = await api.serviceCatalog.featured();
  return response.result;
}

export async function getServiceBySlugAction(slug: string): Promise<ServiceCatalog> {
  return api.serviceCatalog.getBySlug(slug);
}
