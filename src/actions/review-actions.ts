"use server";

import { api } from "@/lib/api";
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

export async function createReviewAction(
  orderId: string,
  data: CreateReviewRequest,
  accessToken: string
): Promise<void> {
  await api.reviews.createWithToken(orderId, data, accessToken);
}

export async function createGuestReviewAction(
  reviewToken: string,
  data: CreateReviewRequest
): Promise<void> {
  await api.reviews.createByToken(reviewToken, data);
}
