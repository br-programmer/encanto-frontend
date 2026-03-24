"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface FeaturedProductsCarouselProps {
  products: Product[];
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth || 250;
    const gap = 16;
    const scrollAmount = cardWidth + gap;

    if (direction === "right" && el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
    }
  }, []);

  // Autoplay
  useEffect(() => {
    if (isHovered || products.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      scroll("right");
    }, 3500);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, products.length, scroll]);

  if (products.length === 0) return null;

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className={cn(
          "absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105",
          canScrollLeft ? "opacity-0 group-hover/carousel:opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className={cn(
          "absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105",
          canScrollRight ? "opacity-0 group-hover/carousel:opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 lg:gap-5 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2 -mx-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[45%] sm:w-[30%] lg:w-[23%]"
          >
            <ProductCard product={product} hideFeaturedBadge index={i} />
          </div>
        ))}
      </div>

    </div>
  );
}
