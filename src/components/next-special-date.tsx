"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarHeart, ArrowRight } from "lucide-react";
import type { SpecialDate } from "@/lib/api";
import { formatDayMonth, todayInTz, daysBetween } from "@/lib/date";

interface SpecialDateDisplay {
  name: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  link: string;
  message: string;
}

function apiToDisplay(sd: SpecialDate): SpecialDateDisplay {
  return {
    name: sd.name,
    startDate: sd.startDate,
    endDate: sd.endDate,
    imageUrl: sd.bannerUrl || "",
    link: `/fechas-especiales/${sd.slug}`,
    message: sd.warningMessage || `Prepara tu regalo para ${sd.name}`,
  };
}

function getUpcomingOrCurrent(dates: SpecialDateDisplay[]): SpecialDateDisplay | null {
  const today = todayInTz();
  const sorted = [...dates].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const current = sorted.find((d) => d.startDate <= today && today <= d.endDate);
  if (current) return current;
  return sorted.find((d) => d.startDate > today) || null;
}

function getDaysUntil(startDate: string): number {
  return daysBetween(todayInTz(), startDate);
}

interface NextSpecialDateProps {
  specialDates?: SpecialDate[];
}

export function NextSpecialDate({ specialDates }: NextSpecialDateProps) {
  const specialDate = useMemo<SpecialDateDisplay | null>(() => {
    if (!specialDates || specialDates.length === 0) return null;
    const displayDates = specialDates
      .filter((sd) => sd.isActive && sd.bannerUrl)
      .map(apiToDisplay);
    return getUpcomingOrCurrent(displayDates);
  }, [specialDates]);

  if (!specialDate) return null;

  const daysUntil = getDaysUntil(specialDate.startDate);
  const isActive = daysUntil <= 0;

  return (
    <section className="relative">
      {/* Top Curve - color of section above (Featured Products = bg-background-alt) */}
      <div className="absolute top-0 left-0 right-0 z-10 overflow-hidden leading-0">
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
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/50" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/90 text-white dark:text-gray-900 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <CalendarHeart className="h-4 w-4" />
              <span className="text-sm font-normal">
                {isActive ? "Disponible ahora" : "Próxima fecha especial"}
              </span>
            </div>

            {/* Countdown */}
            {!isActive && (
              <div className="mb-4 flex items-baseline gap-3">
                <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold text-white font-serif leading-none">
                  {daysUntil}
                </span>
                <span className="text-2xl sm:text-3xl text-white/80 font-light">
                  {daysUntil === 1 ? "día" : "días"}
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-2 font-serif">
              {specialDate.name}
            </h2>

            {/* Date */}
            <p className="text-white/70 text-lg sm:text-xl mb-4">
              {formatDayMonth(specialDate.startDate)}
              {specialDate.endDate !== specialDate.startDate &&
                ` – ${formatDayMonth(specialDate.endDate)}`}
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
      <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden leading-0 rotate-180">
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
