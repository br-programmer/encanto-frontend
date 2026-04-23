"use server";

import { api, ApiError } from "@/lib/api";
import type { CreateReviewRequest, FeaturedReview, PendingReviewOrder } from "@/lib/api";

export async function getFeaturedReviewsAction(): Promise<FeaturedReview[]> {
  const response = await api.reviews.featured();
  return response.result;
}

export async function getPendingReviewsAction(
  accessToken: string
): Promise<PendingReviewOrder[]> {
  try {
    const response = await api.reviews.pendingWithToken(accessToken);
    return response.result;
  } catch {
    return [];
  }
}

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

export async function createReviewAction(
  orderId: string,
  data: CreateReviewRequest,
  accessToken: string
): Promise<void> {
  try {
    await api.reviews.createWithToken(orderId, data, accessToken);
  } catch (err) {
    // Surface the backend message (and full payload on server logs) for diagnosis
    console.error("createReviewAction failed:", {
      orderId,
      data,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    throw new Error(extractBackendMessage(err, "Error al enviar la calificación"));
  }
}

export async function createGuestReviewAction(
  reviewToken: string,
  data: CreateReviewRequest
): Promise<void> {
  try {
    await api.reviews.createByToken(reviewToken, data);
  } catch (err) {
    console.error("createGuestReviewAction failed:", {
      data,
      apiError: err instanceof ApiError ? { status: err.status, body: err.data } : err,
    });
    throw new Error(extractBackendMessage(err, "Error al enviar la calificación"));
  }
}
