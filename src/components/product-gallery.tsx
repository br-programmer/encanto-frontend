"use client";

import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  rounded?: boolean;
}

export function ProductGallery({ images, productName, rounded = true }: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.displayOrder - b.displayOrder;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = sortedImages[selectedIndex];

  const thumbsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = thumbsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = thumbsRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [sortedImages.length]);

  const scrollThumbs = (dir: "left" | "right") => {
    const el = thumbsRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 120);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  if (sortedImages.length === 0) {
    return (
      <div
        className={cn(
          "aspect-square bg-secondary flex items-center justify-center",
          rounded && "rounded-xl"
        )}
      >
        <ShoppingBag className="h-24 w-24 text-foreground-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className={cn(
          "relative aspect-square bg-secondary overflow-hidden group",
          rounded && "rounded-xl"
        )}
      >
        <SafeImage
          src={selectedImage.url}
          alt={selectedImage.altText || productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          fallbackClassName="w-full h-full"
          iconSize="lg"
        />

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md hover:bg-white active:bg-gray-100"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md hover:bg-white active:bg-gray-100"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="relative">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollThumbs("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
              aria-label="Thumbnails anteriores"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollThumbs("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 bg-white/95 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-colors"
              aria-label="Thumbnails siguientes"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <div
            ref={thumbsRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1 scroll-smooth"
          >
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden border-2 transition-colors",
                  rounded && "rounded-lg",
                  index === selectedIndex
                    ? "border-primary"
                    : "border-transparent hover:border-border"
                )}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <SafeImage
                  src={image.url}
                  alt={image.altText || `${productName} - imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 80px"
                  fallbackClassName="w-full h-full"
                  iconSize="sm"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
