"use server";

import { api, ApiError } from "@/lib/api";
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
  ValidateDiscountCodeResult,
  PaymentMethod,
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

export async function previewOrderAction(
  data: PreviewOrderRequest
): Promise<OrderPreview> {
  try {
    return await api.orders.preview(data);
  } catch (err) {
    console.error("previewOrderAction failed:", {
      payload: data,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    throw new Error(extractBackendMessage(err, "Error al calcular el resumen del pedido"));
  }
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
  try {
    return await api.orders.createWithTokens(data, accessToken, guestToken);
  } catch (err) {
    console.error("createOrderAction failed:", {
      payload: data,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    throw new Error(extractBackendMessage(err, "Error al procesar tu pedido"));
  }
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
  try {
    return await api.orders.getByOrderNumberWithTokens(orderNumber, accessToken, guestToken);
  } catch (err) {
    console.error("getOrderByOrderNumberAction failed:", {
      orderNumber,
      hasAccessToken: !!accessToken,
      hasGuestToken: !!guestToken,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    if (err instanceof ApiError) {
      // Encode status into the message so the client page can distinguish
      // 401 (invalid/expired token) from 403 (forbidden) from 404 (not found).
      const beMsg = extractBackendMessage(err, "Error al cargar el pedido");
      throw new Error(`[${err.status}] ${beMsg}`);
    }
    throw err;
  }
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

export async function validateDiscountCodeAction(
  code: string,
  subtotalCents: number,
  paymentMethod: string,
): Promise<{ success: true; data: ValidateDiscountCodeResult } | { success: false; error: string }> {
  try {
    const response = await api.discountCodes.validate({
      code,
      subtotalCents,
      paymentMethod: paymentMethod as PaymentMethod,
    });
    return { success: true, data: response.result };
  } catch (err: unknown) {
    const apiErr = err as { data?: { message?: string } };
    const message = apiErr?.data?.message || "Error al validar el codigo";
    return { success: false, error: message };
  }
}

export async function paypalCreateOrderAction(
  orderId: string,
  accessToken?: string,
  guestToken?: string
): Promise<{ paypalOrderId: string }> {
  return api.orders.paypalCreateOrderWithTokens(orderId, accessToken, guestToken);
}

export async function paypalCaptureAction(
  orderId: string,
  accessToken?: string,
  guestToken?: string
): Promise<Order> {
  return api.orders.paypalCaptureWithTokens(orderId, accessToken, guestToken);
}
