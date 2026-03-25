"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroBanner {
  id: string;
  imageUrl: string;
  imageUrlMobile?: string;
  alt: string;
  link: string;
}

interface HeroCarouselProps {
  banners?: HeroBanner[];
  autoplayDelay?: number;
}

const DEFAULT_BANNERS: HeroBanner[] = [
  {
    id: "1",
    imageUrl: "/banners/banner-1-desktop.jpg",
    imageUrlMobile: "/banners/banner-1-mobile.jpg",
    alt: "Encanto Florería - Arreglos florales para toda ocasión",
    link: "/productos",
  },
  {
    id: "2",
    imageUrl: "/banners/banner-2-desktop.jpg",
    imageUrlMobile: "/banners/banner-2-mobile.jpg",
    alt: "Encanto Florería - Los mejores arreglos de Manta",
    link: "/productos",
  },
];

export function HeroCarousel({
  banners = DEFAULT_BANNERS,
  autoplayDelay = 5000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // Autoplay
  useEffect(() => {
    if (banners.length <= 1 || isHovered || isDragging) return;

    timeoutRef.current = setTimeout(goToNext, autoplayDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, autoplayDelay, goToNext, banners.length, isHovered, isDragging]);

  // Touch/drag handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const point = "touches" in e ? e.touches[0] : e;
    touchStartRef.current = { x: point.clientX, y: point.clientY, time: Date.now() };
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartRef.current) return;

    const point = "changedTouches" in e ? e.changedTouches[0] : e;
    const dx = point.clientX - touchStartRef.current.x;
    const dy = point.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    // Only swipe if horizontal movement is greater than vertical (not scrolling)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && dt < 500) {
      if (dx < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartRef.current = null;
    setIsDragging(false);
  };

  if (banners.length === 0) return null;

  return (
    <section className="bg-background py-4 sm:py-6 lg:py-8">
      <div
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsDragging(false); }}
      >
      {/* Slides Container */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/6] overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {banners.map((banner, index) => (
          <Link
            key={banner.id}
            href={banner.link}
            draggable={false}
            onClick={(e) => { if (isDragging) e.preventDefault(); }}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 select-none",
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Desktop Image */}
            <SafeImage
              src={banner.imageUrl}
              alt={banner.alt}
              fill
              className="object-cover hidden sm:block pointer-events-none"
              priority={index === 0}
              sizes="100vw"
            />
            {/* Mobile Image */}
            <SafeImage
              src={banner.imageUrlMobile || banner.imageUrl}
              alt={banner.alt}
              fill
              className="object-cover sm:hidden pointer-events-none"
              priority={index === 0}
              sizes="100vw"
            />
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
            style={{ opacity: isHovered ? 1 : 0 }}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-white w-6 sm:w-8"
                  : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
