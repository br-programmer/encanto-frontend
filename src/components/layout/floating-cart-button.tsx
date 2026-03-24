"use client";

import { useState, useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function FloatingCartButton() {
  const { totalItems, openCart, isOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalItems() : 0;

  if (count === 0 || isOpen) return null;

  return (
    <button
      onClick={openCart}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full",
        "bg-primary text-white shadow-xl hover:bg-primary-hover transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "animate-in fade-in slide-in-from-bottom-3 duration-300"
      )}
    >
      <ShoppingBag className="h-5 w-5" />
      <span className="font-normal text-sm">Ver carrito</span>
      <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-white text-primary text-xs font-semibold">
        {count > 99 ? "99+" : count}
      </span>
    </button>
  );
}
