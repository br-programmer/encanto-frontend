"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types";

interface ProductsRowProps {
  products: Product[];
  direction?: "left" | "right";
  speed?: number;
}

function ProductsRow({ products, direction = "right", speed = 3500 }: ProductsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > div");
    if (!card) return;
    const cardWidth = card.offsetWidth + 16;
    el.scrollBy({
      left: dir === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  }, []);

  // Start from end if direction is left
  useEffect(() => {
    if (direction === "left") {
      const el = scrollRef.current;
      if (el) el.scrollLeft = el.scrollWidth;
    }
  }, [direction]);

  // Autoplay
  useEffect(() => {
    if (isHovered || products.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      if (direction === "right") {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scroll("right");
        }
      } else {
        if (el.scrollLeft <= 2) {
          el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
        } else {
          scroll("left");
        }
      }
    }, speed);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, products.length, scroll, direction, speed]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={scrollRef}
        className="flex gap-4 lg:gap-5 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2 -mx-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[45%] sm:w-[30%] lg:w-[23%]"
          >
            <ProductCard product={product} hideFeaturedBadge showBorder />
          </div>
        ))}
      </div>
    </div>
  );
}

interface FeaturedProductsCarouselProps {
  products: Product[];
}

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  if (products.length === 0) return null;

  return <ProductsRow products={products} direction="right" speed={3500} />;
}
