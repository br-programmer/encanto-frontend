"use server";

import { api } from "@/lib/api";
import type { InstagramFeedResponse, InstagramFeedFilters } from "@/lib/api";

export async function getInstagramFeedAction(
  filters?: InstagramFeedFilters
): Promise<InstagramFeedResponse> {
  return api.instagram.feed(filters);
}
