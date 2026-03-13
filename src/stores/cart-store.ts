import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartItemAddOn } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem["product"], quantity?: number, addOns?: CartItemAddOn[], cardMessage?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemAddOns: (productId: string, addOns: CartItemAddOn[]) => void;
  updateItemCardMessage: (productId: string, cardMessage: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  totalItems: () => number;
  totalPrice: () => number;
}

function calculateItemAddOnsTotal(addOns?: CartItemAddOn[]): number {
  if (!addOns) return 0;
  return addOns.reduce((total, addOn) => total + addOn.priceCents * addOn.quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, addOns, cardMessage) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      ...(addOns !== undefined ? { addOns } : {}),
                      ...(cardMessage !== undefined ? { cardMessage } : {}),
                    }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity, addOns, cardMessage }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      updateItemAddOns: (productId, addOns) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, addOns } : item
          ),
        }));
      },

      updateItemCardMessage: (productId, cardMessage) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, cardMessage } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) =>
            total +
            (item.product.priceCents + calculateItemAddOnsTotal(item.addOns)) * item.quantity,
          0
        );
      },
    }),
    {
      name: "encanto-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
