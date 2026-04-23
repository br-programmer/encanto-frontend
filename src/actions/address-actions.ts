"use server";

import { api } from "@/lib/api";
import type {
  DeliveryAddressApi,
  CreateDeliveryAddressRequest,
  UpdateDeliveryAddressRequest,
  PaginatedResponse,
} from "@/lib/api";

export async function getDeliveryAddressesAction(
  accessToken: string,
  filters?: { page?: number; limit?: number }
): Promise<PaginatedResponse<DeliveryAddressApi>> {
  return api.deliveryAddresses.listWithToken(accessToken, filters);
}

export async function getDefaultDeliveryAddressAction(
  accessToken: string
): Promise<DeliveryAddressApi | null> {
  return api.deliveryAddresses.getDefaultWithToken(accessToken);
}

export async function getDeliveryAddressByIdAction(
  id: string,
  accessToken: string
): Promise<DeliveryAddressApi> {
  return api.deliveryAddresses.getByIdWithToken(id, accessToken);
}

export async function createDeliveryAddressAction(
  data: CreateDeliveryAddressRequest,
  accessToken: string
): Promise<DeliveryAddressApi> {
  return api.deliveryAddresses.createWithToken(data, accessToken);
}

export async function updateDeliveryAddressAction(
  id: string,
  data: UpdateDeliveryAddressRequest,
  accessToken: string
): Promise<DeliveryAddressApi> {
  return api.deliveryAddresses.updateWithToken(id, data, accessToken);
}

export async function deleteDeliveryAddressAction(
  id: string,
  accessToken: string
): Promise<void> {
  return api.deliveryAddresses.deleteWithToken(id, accessToken);
}

export async function setDefaultDeliveryAddressAction(
  id: string,
  accessToken: string
): Promise<DeliveryAddressApi> {
  return api.deliveryAddresses.setDefaultWithToken(id, accessToken);
}
