"use server";

import { api } from "@/lib/api";
import type {
  ServiceOffer,
  AcceptServiceOffer,
  AcceptOfferResponse,
  PaginatedResponse,
} from "@/lib/api";

export async function getServiceOfferAction(
  offerNumber: string,
  accessToken?: string,
  guestToken?: string
): Promise<ServiceOffer> {
  return api.serviceOffers.getByNumberWithToken(offerNumber, accessToken, guestToken);
}

export async function acceptServiceOfferAction(
  id: string,
  data: AcceptServiceOffer,
  accessToken?: string,
  guestToken?: string
): Promise<AcceptOfferResponse> {
  return api.serviceOffers.acceptWithToken(id, data, accessToken, guestToken);
}

export async function rejectServiceOfferAction(
  id: string,
  accessToken?: string,
  guestToken?: string
): Promise<{ rejected: boolean; offerNumber: string }> {
  return api.serviceOffers.rejectWithToken(id, accessToken, guestToken);
}

export async function getMyServiceOffersAction(
  accessToken: string,
  filters?: { page?: number; limit?: number }
): Promise<PaginatedResponse<ServiceOffer>> {
  return api.serviceOffers.mineWithToken(accessToken, filters);
}

export async function claimGuestServiceOffersAction(
  accessToken: string
): Promise<{ claimedCount: number }> {
  return api.serviceOffers.claimGuestOffersWithToken(accessToken);
}
