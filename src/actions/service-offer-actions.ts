"use server";

import { api } from "@/lib/api";
import type {
  ServiceOffer,
  AcceptServiceOffer,
  AcceptOfferResponse,
  PaginatedResponse,
} from "@/lib/api";

export async function getServiceOfferAction(id: string): Promise<ServiceOffer> {
  return api.serviceOffers.getById(id);
}

export async function acceptServiceOfferAction(
  id: string,
  data: AcceptServiceOffer
): Promise<AcceptOfferResponse> {
  return api.serviceOffers.accept(id, data);
}

export async function rejectServiceOfferAction(
  id: string
): Promise<{ rejected: boolean; offerNumber: string }> {
  return api.serviceOffers.reject(id);
}

export async function getMyServiceOffersAction(
  accessToken: string,
  filters?: { page?: number; limit?: number }
): Promise<PaginatedResponse<ServiceOffer>> {
  return api.serviceOffers.mineWithToken(accessToken, filters);
}
