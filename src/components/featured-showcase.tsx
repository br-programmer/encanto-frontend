"use client";

import { useState, useEffect, useRef } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ShowcaseItem {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  linkLabel?: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    title: "Ramo de Rosas Rojas",
    description: "El clásico que nunca falla. Nuestro ramo de rosas rojas es el detalle perfecto para expresar amor, gratitud o simplemente alegrar el día de alguien especial. Cada rosa es seleccionada a mano para garantizar frescura y calidad.",
    link: "/productos/ramo-12-rosas-rojas",
    linkLabel: "Ver detalle",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
    title: "Arreglo Primaveral",
    description: "Una explosión de color y alegría. Este arreglo combina las flores más vibrantes de la temporada en una composición única que iluminará cualquier espacio. Ideal para cumpleaños, celebraciones o para decorar tu hogar.",
    link: "/productos",
    linkLabel: "Ver detalle",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
    title: "Bouquet Elegante",
    description: "Sofisticación en cada pétalo. Diseñado para las ocasiones más especiales, este bouquet combina tonos suaves y texturas delicadas que transmiten elegancia y buen gusto. Perfecto para aniversarios y momentos inolvidables.",
    link: "/productos",
    linkLabel: "Ver detalle",
  },
];

interface FeaturedShowcaseProps {
  items?: ShowcaseItem[];
  autoplayDelay?: number;
}

export function FeaturedShowcase({ items = SHOWCASE_ITEMS, autoplayDelay = 6000 }: FeaturedShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length <= 1 || isHovered) return;
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoplayDelay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [currentIndex, autoplayDelay, items.length, isHovered]);

  if (items.length === 0) return null;

  const current = items[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[400px] sm:min-h-[500px]">
        {/* Image */}
        <div className="relative aspect-[4/5] sm:aspect-auto overflow-hidden">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === currentIndex ? "opacity-100" : "opacity-0"
              )}
            >
              <SafeImage
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <div className="max-w-md">
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6 tracking-wide">
              {current.title}
            </h3>
            <p className="text-foreground-secondary text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
              {current.description}
            </p>
            <Button variant="outline" size="lg" asChild className="uppercase tracking-widest text-xs sm:text-sm px-8 h-11 sm:h-12 border-primary/30 hover:bg-primary/5 hover:text-primary">
              <Link href={current.link}>
                {current.linkLabel || "Ver más"}
              </Link>
            </Button>
          </div>

          {/* Dots */}
          {items.length > 1 && (
            <div className="flex gap-2.5 mt-8 sm:mt-10">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    i === currentIndex ? "bg-primary" : "bg-primary/25 hover:bg-primary/50"
                  )}
                  aria-label={`Ir a slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
