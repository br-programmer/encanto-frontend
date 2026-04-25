"use server";

import { api, ApiError } from "@/lib/api";
import type {
  ServiceOffer,
  AcceptServiceOffer,
  AcceptOfferResponse,
  PaginatedResponse,
} from "@/lib/api";

function extractBackendMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const data = err.data as { message?: string | string[] } | null;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    return `${err.status} ${err.statusText}`;
  }
  return err instanceof Error ? err.message : fallback;
}

export async function getServiceOfferAction(
  offerNumber: string,
  accessToken?: string,
  guestToken?: string
): Promise<ServiceOffer> {
  try {
    return await api.serviceOffers.getByNumberWithToken(offerNumber, accessToken, guestToken);
  } catch (err) {
    if (err instanceof ApiError) {
      const beMsg = extractBackendMessage(err, "Error al cargar la propuesta");
      throw new Error(`[${err.status}] ${beMsg}`);
    }
    throw err;
  }
}

export async function acceptServiceOfferAction(
  id: string,
  data: AcceptServiceOffer,
  accessToken?: string,
  guestToken?: string
): Promise<AcceptOfferResponse> {
  try {
    return await api.serviceOffers.acceptWithToken(id, data, accessToken, guestToken);
  } catch (err) {
    console.error("acceptServiceOfferAction failed:", {
      id,
      payload: data,
      hasAccessToken: !!accessToken,
      hasGuestToken: !!guestToken,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    throw new Error(extractBackendMessage(err, "Error al aceptar la propuesta"));
  }
}

export async function rejectServiceOfferAction(
  id: string,
  accessToken?: string,
  guestToken?: string
): Promise<{ rejected: boolean; offerNumber: string }> {
  try {
    return await api.serviceOffers.rejectWithToken(id, accessToken, guestToken);
  } catch (err) {
    console.error("rejectServiceOfferAction failed:", {
      id,
      hasAccessToken: !!accessToken,
      hasGuestToken: !!guestToken,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    throw new Error(extractBackendMessage(err, "Error al rechazar la propuesta"));
  }
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
