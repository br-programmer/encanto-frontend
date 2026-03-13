"use server";

import { api } from "@/lib/api";
import type {
  DeliveryAddressApi,
  CreateDeliveryAddressRequest,
  PaginatedResponse,
} from "@/lib/api";

export async function getDeliveryAddressesAction(
  accessToken: string,
  filters?: { page?: number; limit?: number }
): Promise<PaginatedResponse<DeliveryAddressApi>> {
  return api.deliveryAddresses.listWithToken(accessToken, filters);
}

export async function createDeliveryAddressAction(
  data: CreateDeliveryAddressRequest,
  accessToken: string
): Promise<DeliveryAddressApi> {
  return api.deliveryAddresses.createWithToken(data, accessToken);
}
