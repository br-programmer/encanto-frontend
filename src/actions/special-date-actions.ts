"use server";

import { api, ApiError } from "@/lib/api";
import type { SpecialDate } from "@/lib/api";

export async function getActiveSpecialDatesAction(): Promise<SpecialDate[]> {
  try {
    return await api.specialDates.active();
  } catch (err) {
    console.error("Error fetching active special dates:", err);
    return [];
  }
}

export async function getSpecialDateBySlugAction(
  slug: string
): Promise<SpecialDate | null> {
  try {
    return await api.specialDates.getBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    console.error(`Error fetching special date ${slug}:`, err);
    return null;
  }
}
