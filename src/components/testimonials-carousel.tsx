"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, MessageCircle } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  avatarUrl?: string | null;
  adminReply?: string | null;
}

// Mock data — will be replaced with API call
const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "María García",
    city: "Manta",
    rating: 5,
    comment: "Los arreglos son hermosos y siempre llegan frescos. Mi mamá quedó encantada con las rosas que le envié por su cumpleaños.",
    date: "2026-03-10",
  },
  {
    id: "2",
    name: "Carlos Mendoza",
    city: "Manta",
    rating: 5,
    comment: "Excelente servicio de entrega. Pedí un arreglo para mi esposa y llegó a tiempo y en perfectas condiciones. Muy recomendado.",
    date: "2026-03-05",
  },
  {
    id: "3",
    name: "Ana Lucía Torres",
    city: "Portoviejo",
    rating: 5,
    comment: "La calidad de las flores es increíble. He comprado varias veces y siempre supera mis expectativas. El mejor detalle para cualquier ocasión.",
    date: "2026-02-28",
  },
  {
    id: "4",
    name: "Roberto Cedeño",
    city: "Manta",
    rating: 4,
    comment: "Muy buen servicio, las flores llegaron frescas y el arreglo estaba precioso. Mi novia quedó feliz con la sorpresa.",
    date: "2026-02-20",
  },
  {
    id: "5",
    name: "Daniela Vega",
    city: "Montecristi",
    rating: 5,
    comment: "Pedí un arreglo para el aniversario de mis padres y fue un éxito total. La atención por WhatsApp es muy rápida y amable.",
    date: "2026-02-14",
  },
  {
    id: "6",
    name: "Fernando Alcívar",
    city: "Manta",
    rating: 5,
    comment: "Siempre confío en Encanto para mis regalos especiales. Las flores duran mucho más que las de otros lugares. 100% recomendado.",
    date: "2026-02-10",
  },
];

interface TestimonialsCarouselProps {
  testimonials?: Testimonial[];
}

export function TestimonialsCarousel({ testimonials = MOCK_TESTIMONIALS }: TestimonialsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 320;
    const card = el.querySelector<HTMLElement>(":scope > div");
    if (!card) return 320;
    return card.offsetWidth + 16;
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = getCardWidth();
    el.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  }, [getCardWidth]);

  // Autoplay
  useEffect(() => {
    if (isHovered || testimonials.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      scroll("right");
    }, 4000);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, testimonials.length, scroll]);

  if (testimonials.length === 0) return null;

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Arrows */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 opacity-0 group-hover/carousel:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 opacity-0 group-hover/carousel:opacity-100"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2 -mx-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="shrink-0 w-[85%] sm:w-[45%] lg:w-[30%]"
          >
            <div className="bg-white dark:bg-stone-900 border border-border p-5 sm:p-6 h-full flex flex-col">
              {/* Quote icon */}
              <Quote className="h-6 w-6 text-primary/30 mb-3 shrink-0" />

              {/* Comment */}
              <p className="text-sm text-foreground-secondary leading-relaxed flex-1 line-clamp-4">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              {/* Admin Reply */}
              {testimonial.adminReply && (
                <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MessageCircle className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">Encanto</span>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {testimonial.adminReply}
                  </p>
                </div>
              )}

              {/* Rating + Author */}
              <div className="mt-4 pt-4 border-t border-border">
                {/* Stars */}
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={cn(
                        "h-3.5 w-3.5",
                        j < testimonial.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-foreground-muted"
                      )}
                    />
                  ))}
                </div>

                {/* Author with avatar */}
                <div className="flex items-center gap-2.5">
                  {testimonial.avatarUrl ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <SafeImage
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-normal text-foreground">{testimonial.name}</p>
                    {testimonial.city && (
                      <p className="text-xs text-foreground-muted">{testimonial.city}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
