"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useScrollTopStore } from "@/stores/scroll-top-store";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [mounted, setMounted] = useState(false);
  const { isOpen } = useCartStore();
  const { isVisible, setIsVisible } = useScrollTopStore();

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

  if (!mounted) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-sm text-foreground text-xs font-medium tracking-wide uppercase transition-all duration-300",
        isVisible && !isOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
      style={{ background: "linear-gradient(to right, transparent 0%, color-mix(in srgb, var(--secondary) 95%, transparent) 15%, color-mix(in srgb, var(--secondary) 95%, transparent) 85%, transparent 100%)" }}
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-3.5 w-3.5 animate-bounce" />
      Volver arriba
    </button>
  );
}
