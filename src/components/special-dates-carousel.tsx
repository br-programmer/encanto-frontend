"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  link: string;
}

interface SpecialDatesCarouselProps {
  slides?: CarouselSlide[];
  autoplayDelay?: number;
}

// Mock data for development - will be replaced with API data
const MOCK_SLIDES: CarouselSlide[] = [
  {
    id: "1",
    number: "01",
    title: "Día de las",
    subtitle: "Madres",
    imageUrl: "https://picsum.photos/seed/mothers/800/600",
    link: "/productos?ocasion=dia-madres",
  },
  {
    id: "2",
    number: "02",
    title: "San",
    subtitle: "Valentín",
    imageUrl: "https://picsum.photos/seed/valentine/800/600",
    link: "/productos?ocasion=san-valentin",
  },
  {
    id: "3",
    number: "03",
    title: "Feliz",
    subtitle: "Navidad",
    imageUrl: "https://picsum.photos/seed/christmas/800/600",
    link: "/productos?ocasion=navidad",
  },
  {
    id: "4",
    number: "04",
    title: "Día del",
    subtitle: "Padre",
    imageUrl: "https://picsum.photos/seed/fathers/800/600",
    link: "/productos?ocasion=dia-padre",
  },
];

export function SpecialDatesCarousel({
  slides = MOCK_SLIDES,
  autoplayDelay = 5000,
}: SpecialDatesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextIndex = (currentIndex + 1) % slides.length;

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
    if (slides.length <= 1) return;

    timeoutRef.current = setTimeout(goToNext, autoplayDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, autoplayDelay, goToNext, slides.length]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const nextSlide = slides[nextIndex];

  return (
    <section className="relative w-full bg-section-dark overflow-hidden">
      <div className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
        {/* Background Number */}
        <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span
            className={cn(
              "text-[150px] md:text-[200px] lg:text-[280px] font-bold text-white/[0.08] leading-none transition-all duration-500",
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
                      "text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-500",
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
                {slides.length > 1 && (
                  <div className="flex gap-2 mt-12">
                    {slides.map((_, index) => (
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
                        "relative aspect-[4/5] md:aspect-[4/5] rounded-lg overflow-hidden transition-all duration-500",
                        isTransitioning && "scale-95 opacity-0 -translate-x-8"
                      )}
                    >
                      <Image
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
                  {slides.length > 1 && (
                    <div className="hidden md:block w-1/3 relative">
                      <div
                        className={cn(
                          "relative aspect-[4/5] rounded-lg overflow-hidden opacity-40 transition-all duration-500",
                          isTransitioning && "opacity-100 scale-105"
                        )}
                      >
                        <Image
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
          <span className="hover:text-white/80 cursor-pointer">facebook</span>
          <span className="hover:text-white/80 cursor-pointer">instagram</span>
        </div>
      </div>
    </section>
  );
}
