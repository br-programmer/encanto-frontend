"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isOpen, totalItems } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const hasCartItems = mounted && totalItems() > 0;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed right-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg transition-all duration-300 hover:bg-primary/90 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50",
        hasCartItems ? "bottom-[5.5rem]" : "bottom-6",
        isVisible && !isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
