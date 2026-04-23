"use server";

import { api } from "@/lib/api";
import type { CreateServiceRequest, ServiceRequest, PaginatedResponse } from "@/lib/api";

export async function submitServiceRequestAction(
  data: CreateServiceRequest
): Promise<{ success: true; guestToken?: string } | { success: false; error: string }> {
  try {
    const response = await api.serviceRequests.create(data);
    return { success: true, guestToken: response.guestToken };
  } catch (err: unknown) {
    const apiErr = err as { status?: number; data?: { message?: string } };

    if (apiErr.status === 429) {
      return { success: false, error: "Has enviado demasiadas solicitudes. Intenta en un minuto." };
    }

    const message = apiErr?.data?.message || "Error al enviar la solicitud. Intenta de nuevo.";
    return { success: false, error: message };
  }
}

export async function getMyServiceRequestsAction(
  accessToken: string,
  filters?: { page?: number; limit?: number }
): Promise<PaginatedResponse<ServiceRequest>> {
  return api.serviceRequests.mineWithToken(accessToken, filters);
}

export async function claimGuestServiceRequestsAction(
  accessToken: string
): Promise<{ claimedCount: number }> {
  return api.serviceRequests.claimGuestRequestsWithToken(accessToken);
}
