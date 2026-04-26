"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { BUSINESS } from "@/lib/constants";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpecialDate } from "@/lib/api";

export interface CarouselSlide {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link: string;
  warning?: string | null;
}

interface SpecialDatesCarouselProps {
  slides?: CarouselSlide[];
  specialDates?: SpecialDate[];
  autoplayDelay?: number;
}

// Convert API special dates to carousel slides
function specialDatesToSlides(dates: SpecialDate[]): CarouselSlide[] {
  return dates
    .filter((sd) => sd.isActive && sd.bannerUrl)
    .slice(0, 6)
    .map((sd, index) => {
      const nameParts = sd.name.split(" ");
      const midpoint = Math.ceil(nameParts.length / 2);
      const title = nameParts.slice(0, midpoint).join(" ");
      const subtitle = nameParts.slice(midpoint).join(" ");

      return {
        id: sd.id,
        number: String(index + 1).padStart(2, "0"),
        title,
        subtitle: subtitle || undefined,
        imageUrl: sd.bannerUrl!,
        link: `/fechas-especiales/${sd.slug}`,
        warning: sd.warningMessage,
      };
    });
}

export function SpecialDatesCarousel({
  slides,
  specialDates,
  autoplayDelay = 5000,
}: SpecialDatesCarouselProps) {
  const resolvedSlides =
    slides ?? (specialDates ? specialDatesToSlides(specialDates) : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasSlides = resolvedSlides.length > 0;
  const nextIndex = hasSlides ? (currentIndex + 1) % resolvedSlides.length : 0;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 600);
    },
    [currentIndex, isTransitioning]
  );

  const goToNext = useCallback(() => {
    goToSlide(nextIndex);
  }, [goToSlide, nextIndex]);

  // Autoplay
  useEffect(() => {
    if (resolvedSlides.length <= 1) return;

    timeoutRef.current = setTimeout(goToNext, autoplayDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, autoplayDelay, goToNext, resolvedSlides.length]);

  if (!hasSlides) return null;

  const currentSlide = resolvedSlides[currentIndex];
  const nextSlide = resolvedSlides[nextIndex];

  return (
    <section className="relative w-full bg-section-dark overflow-hidden">
      <div className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
        {/* Background Number */}
        <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span
            className={cn(
              "text-[150px] md:text-[200px] lg:text-[280px] font-semibold text-white/8 leading-none transition-all duration-500",
              isTransitioning && "opacity-0 -translate-y-4"
            )}
          >
            {currentSlide.number}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Text Content */}
              <div className="order-2 lg:order-1 pt-8 lg:pt-0">
                {/* Title */}
                <div className="mb-6">
                  <h2
                    className={cn(
                      "text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight transition-all duration-500",
                      isTransitioning && "opacity-0 translate-y-4"
                    )}
                  >
                    {currentSlide.title}
                    {currentSlide.subtitle && (
                      <>
                        <br />
                        <span className="text-white/90">{currentSlide.subtitle}</span>
                      </>
                    )}
                  </h2>
                </div>

                {/* Warning badge */}
                {currentSlide.warning && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 bg-amber-500/90 text-white px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm transition-all duration-500",
                      isTransitioning && "opacity-0"
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs font-normal">{currentSlide.warning}</span>
                  </div>
                )}

                {/* View Button */}
                <Link
                  href={currentSlide.link}
                  className={cn(
                    "inline-flex items-center text-white/80 hover:text-white text-sm uppercase tracking-wider transition-all duration-500 group",
                    isTransitioning && "opacity-0"
                  )}
                >
                  <span className="border-b border-white/40 group-hover:border-white pb-1">
                    Ver Arreglos
                  </span>
                </Link>

                {/* Progress Bars */}
                {resolvedSlides.length > 1 && (
                  <div className="flex gap-2 mt-12">
                    {resolvedSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                          "h-[3px] rounded-full transition-all duration-300",
                          index === currentIndex
                            ? "bg-primary w-10"
                            : "bg-white/30 w-6 hover:bg-white/50"
                        )}
                        aria-label={`Ir a slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Images */}
              <div className="order-1 lg:order-2 relative">
                <div className="flex gap-4 md:gap-6">
                  {/* Main Image */}
                  <div className="flex-1 relative">
                    <div
                      className={cn(
                        "relative aspect-4/5 md:aspect-4/5 rounded-lg overflow-hidden transition-all duration-500",
                        isTransitioning && "scale-95 opacity-0 -translate-x-8"
                      )}
                    >
                      <SafeImage
                        src={currentSlide.imageUrl}
                        alt={`${currentSlide.title} ${currentSlide.subtitle || ""}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>

                  {/* Preview Image (Next Slide) */}
                  {resolvedSlides.length > 1 && (
                    <div className="hidden md:block w-1/3 relative">
                      <div
                        className={cn(
                          "relative aspect-4/5 rounded-lg overflow-hidden opacity-40 transition-all duration-500",
                          isTransitioning && "opacity-100 scale-105"
                        )}
                      >
                        <SafeImage
                          src={nextSlide.imageUrl}
                          alt={`${nextSlide.title} ${nextSlide.subtitle || ""}`}
                          fill
                          className="object-cover"
                          sizes="20vw"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Social Links (decorative) */}
        <div className="absolute bottom-6 right-8 hidden lg:flex gap-6 text-white/50 text-sm">
          <a href={BUSINESS.social.tiktok.url} target="_blank" rel="noopener noreferrer" className="hover:text-white/80">tiktok</a>
          <a href={BUSINESS.social.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-white/80">instagram</a>
        </div>
      </div>
    </section>
  );
}
