import { create } from "zustand";
import type { SpecialDate } from "@/lib/api";
import { getActiveSpecialDatesAction } from "@/actions/special-date-actions";

interface SpecialDatesState {
  specialDates: SpecialDate[];
  byId: Map<string, SpecialDate>;
  bySlug: Map<string, SpecialDate>;
  isLoaded: boolean;
  isLoading: boolean;
  fetch: () => Promise<void>;
  getById: (id: string | null | undefined) => SpecialDate | null;
  getBySlug: (slug: string) => SpecialDate | null;
}

export const useSpecialDatesStore = create<SpecialDatesState>((set, get) => ({
  specialDates: [],
  byId: new Map(),
  bySlug: new Map(),
  isLoaded: false,
  isLoading: false,

  fetch: async () => {
    const state = get();
    if (state.isLoading || state.isLoaded) return;
    set({ isLoading: true });
    try {
      const data = await getActiveSpecialDatesAction();
      const byId = new Map(data.map((sd) => [sd.id, sd]));
      const bySlug = new Map(data.map((sd) => [sd.slug, sd]));
      set({ specialDates: data, byId, bySlug, isLoaded: true, isLoading: false });
    } catch {
      set({ isLoading: false, isLoaded: true });
    }
  },

  getById: (id) => {
    if (!id) return null;
    return get().byId.get(id) ?? null;
  },

  getBySlug: (slug) => {
    return get().bySlug.get(slug) ?? null;
  },
}));
