import { create } from "zustand";

interface ScrollTopState {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

export const useScrollTopStore = create<ScrollTopState>((set) => ({
  isVisible: false,
  setIsVisible: (visible) => set({ isVisible: visible }),
}));
