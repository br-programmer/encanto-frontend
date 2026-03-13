"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarHeart, ArrowRight } from "lucide-react";
import type { SpecialDate } from "@/lib/api";

interface SpecialDateDisplay {
  name: string;
  date: Date;
  imageUrl: string;
  link: string;
  message: string;
}

// Fallback special dates when API data is not available
function getFallbackSpecialDates(): SpecialDateDisplay[] {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  return [
    {
      name: "Día de San Valentín",
      date: new Date(currentYear, 1, 14),
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80",
      link: "/productos?ocasion=amor",
      message: "Sorprende a quien amas con un arreglo especial",
    },
    {
      name: "Día de la Mujer",
      date: new Date(currentYear, 2, 8),
      imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80",
      link: "/productos?ocasion=agradecimiento",
      message: "Celebra a las mujeres especiales en tu vida",
    },
    {
      name: "Día de las Madres",
      date: new Date(currentYear, 4, 11),
      imageUrl: "https://images.unsplash.com/photo-1462275646964-a0e3571f4f5f?w=1920&q=80",
      link: "/productos?ocasion=dia-madres",
      message: "El regalo perfecto para mamá",
    },
    {
      name: "Día del Padre",
      date: new Date(currentYear, 5, 16),
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
      link: "/productos?ocasion=dia-padre",
      message: "Demuéstrale a papá cuánto lo quieres",
    },
    {
      name: "Día de los Difuntos",
      date: new Date(currentYear, 10, 2),
      imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1920&q=80",
      link: "/productos?ocasion=condolencias",
      message: "Honra la memoria de tus seres queridos",
    },
    {
      name: "Navidad",
      date: new Date(currentYear, 11, 25),
      imageUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1920&q=80",
      link: "/productos?ocasion=navidad",
      message: "Comparte la alegría navideña con flores",
    },
    {
      name: "Día de San Valentín",
      date: new Date(nextYear, 1, 14),
      imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80",
      link: "/productos?ocasion=amor",
      message: "Sorprende a quien amas con un arreglo especial",
    },
  ];
}

function apiToDisplay(sd: SpecialDate): SpecialDateDisplay {
  return {
    name: sd.name,
    date: new Date(sd.date + "T00:00:00"),
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80",
    link: "/productos",
    message: sd.warningMessage || `Prepara tu regalo para ${sd.name}`,
  };
}

function getNextDate(dates: SpecialDateDisplay[]): SpecialDateDisplay | null {
  const now = new Date();
  const upcoming = dates
    .filter((d) => d.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  return upcoming[0] || null;
}

function getDaysUntil(date: Date): number {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
  });
}

interface NextSpecialDateProps {
  specialDates?: SpecialDate[];
}

export function NextSpecialDate({ specialDates }: NextSpecialDateProps) {
  const [specialDate, setSpecialDate] = useState<SpecialDateDisplay | null>(null);

  useEffect(() => {
    const displayDates = specialDates && specialDates.length > 0
      ? specialDates.map(apiToDisplay)
      : getFallbackSpecialDates();
    setSpecialDate(getNextDate(displayDates));
  }, [specialDates]);

  if (!specialDate) return null;

  const daysUntil = getDaysUntil(specialDate.date);

  return (
    <section className="relative">
      {/* Top Curve - color of section above (Featured Products = bg-background-alt) */}
      <div className="absolute top-0 left-0 right-0 z-10 overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[50px] sm:h-[70px] md:h-[90px]"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            style={{ fill: "var(--background-alt)" }}
            opacity="1"
          />
        </svg>
      </div>

      {/* Parallax Container */}
      <div
        className="relative min-h-[450px] sm:min-h-[500px] md:min-h-[550px] flex items-center bg-scroll md:bg-fixed bg-center bg-cover"
        style={{
          backgroundImage: `url(${specialDate.imageUrl})`,
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/50" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/90 text-white dark:text-gray-900 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <CalendarHeart className="h-4 w-4" />
              <span className="text-sm font-medium">Próxima fecha especial</span>
            </div>

            {/* Countdown */}
            <div className="mb-4 flex items-baseline gap-3">
              <span className="text-7xl sm:text-8xl md:text-9xl font-bold text-white font-serif leading-none">
                {daysUntil}
              </span>
              <span className="text-2xl sm:text-3xl text-white/80 font-light">
                {daysUntil === 1 ? "día" : "días"}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 font-serif">
              {specialDate.name}
            </h2>

            {/* Date */}
            <p className="text-white/70 text-lg sm:text-xl mb-4">
              {formatDate(specialDate.date)}
            </p>

            {/* Message */}
            <p className="text-white/80 text-base sm:text-lg mb-8 max-w-lg">
              {specialDate.message}
            </p>

            {/* CTA Button */}
            <Button
              size="lg"
              className="h-12 px-8 bg-white dark:bg-white text-gray-900 dark:text-gray-900 hover:bg-white/90 dark:hover:bg-white/90 shadow-lg"
              asChild
            >
              <Link href={specialDate.link}>
                Ver arreglos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Curve */}
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden leading-[0] rotate-180">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-[calc(100%+1.3px)] h-[50px] sm:h-[70px] md:h-[90px]"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            style={{ fill: "var(--background)" }}
            opacity="1"
          />
        </svg>
      </div>
    </section>
  );
}
