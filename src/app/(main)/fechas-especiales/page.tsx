import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { CalendarHeart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { getActiveSpecialDatesAction } from "@/actions/special-date-actions";
import type { SpecialDate } from "@/lib/api";

export const revalidate = 300;

export const metadata = {
  title: "Fechas Especiales | Encanto Floristería",
  description:
    "Descubre nuestros catálogos exclusivos para fechas especiales: San Valentín, Día de la Madre y más.",
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });
  if (start.getTime() === end.getTime()) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

function getStatus(sd: SpecialDate): { label: string; isActive: boolean; daysUntil: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(sd.startDate + "T00:00:00");
  const end = new Date(sd.endDate + "T00:00:00");
  if (start <= today && today <= end) {
    return { label: "Disponible ahora", isActive: true, daysUntil: 0 };
  }
  const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return {
    label: `Faltan ${diff} ${diff === 1 ? "día" : "días"}`,
    isActive: false,
    daysUntil: diff,
  };
}

function sortByRelevance(dates: SpecialDate[]): SpecialDate[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return [...dates].sort((a, b) => {
    const aStart = new Date(a.startDate + "T00:00:00").getTime();
    const bStart = new Date(b.startDate + "T00:00:00").getTime();
    const aEnd = new Date(a.endDate + "T00:00:00").getTime();
    const bEnd = new Date(b.endDate + "T00:00:00").getTime();
    const t = today.getTime();
    const aActive = aStart <= t && t <= aEnd;
    const bActive = bStart <= t && t <= bEnd;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return aStart - bStart;
  });
}

export default async function FechasEspecialesPage() {
  const dates = await getActiveSpecialDatesAction();
  const sorted = sortByRelevance(dates.filter((d) => d.isActive));

  return (
    <div className="min-h-screen bg-background-alt">
      <Breadcrumb items={[{ label: "Fechas Especiales" }]} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-3xl sm:text-4xl font-serif">Fechas Especiales</h1>
        <p className="text-sm sm:text-base text-foreground-secondary mt-2 max-w-2xl">
          Catálogos exclusivos para celebrar los momentos más importantes del año.
        </p>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sorted.map((sd) => {
              const status = getStatus(sd);
              return (
                <Link
                  key={sd.id}
                  href={`/fechas-especiales/${sd.slug}`}
                  className="group block bg-white dark:bg-stone-900 shadow-md border border-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Polaroid photo area */}
                  <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
                    <div className="relative aspect-4/3 overflow-hidden bg-secondary">
                      {sd.bannerUrl ? (
                        <SafeImage
                          src={sd.bannerUrl}
                          alt={sd.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          fallbackClassName="w-full h-full"
                          iconSize="lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-secondary to-accent flex items-center justify-center">
                          <CalendarHeart className="h-12 w-12 text-foreground-muted" />
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={status.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Polaroid caption */}
                  <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 text-center">
                    <h3 className="font-serif text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                      {sd.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground-secondary mt-1">
                      {formatDateRange(sd.startDate, sd.endDate)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <CalendarHeart className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-sm sm:text-base text-foreground-secondary">
              No hay fechas especiales activas en este momento.
            </p>
            <Link
              href="/productos"
              className="inline-block mt-4 text-sm sm:text-base text-primary hover:underline"
            >
              Ver todos los productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
