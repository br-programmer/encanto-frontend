"use server";

import { api } from "@/lib/api";
import type {
  Order,
  OrderListItem,
  OrderPreview,
  CreateOrderRequest,
  PreviewOrderRequest,
  OrderItemRequest,
  OrderFilters,
  PaginatedResponse,
  BankAccount,
  DeliveryTimeSlot,
} from "@/lib/api";

export async function previewOrderAction(
  data: PreviewOrderRequest
): Promise<OrderPreview> {
  return api.orders.preview(data);
}

export async function estimateTimeAction(data: {
  branchId: string;
  items: OrderItemRequest[];
}): Promise<{ estimatedPrepMinutes: number }> {
  return api.orders.estimateTime(data);
}

export async function createOrderAction(
  data: CreateOrderRequest,
  accessToken?: string,
  guestToken?: string
): Promise<Order> {
  return api.orders.createWithTokens(data, accessToken, guestToken);
}

export async function getMyOrdersAction(
  filters: OrderFilters,
  accessToken: string
): Promise<PaginatedResponse<OrderListItem>> {
  return api.orders.myWithToken(filters, accessToken);
}

export async function getOrderByOrderNumberAction(
  orderNumber: string,
  accessToken?: string,
  guestToken?: string
): Promise<Order> {
  return api.orders.getByOrderNumberWithTokens(orderNumber, accessToken, guestToken);
}

export async function cancelOrderAction(
  id: string,
  accessToken?: string,
  guestToken?: string
): Promise<Order> {
  return api.orders.cancelWithTokens(id, accessToken, guestToken);
}

export async function getOrderPageDataAction(): Promise<{
  bankAccounts: BankAccount[];
  timeSlots: DeliveryTimeSlot[];
}> {
  const [bankAccounts, timeSlots] = await Promise.all([
    api.bankAccounts.active(),
    api.timeSlots.active(),
  ]);
  return { bankAccounts, timeSlots };
}

export async function uploadTransferProofAction(
  orderId: string,
  formData: FormData,
  accessToken?: string,
  guestToken?: string
): Promise<Order> {
  return api.orders.uploadTransferProofWithTokens(orderId, formData, accessToken, guestToken);
}

export async function claimGuestOrdersAction(
  accessToken: string
): Promise<{ claimedCount: number }> {
  return api.orders.claimGuestOrdersWithToken(accessToken);
}
