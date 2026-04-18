import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";
import { getSpecialDateBySlugAction } from "@/actions/special-date-actions";

export const revalidate = 300;

interface SpecialDatePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-EC", { day: "numeric", month: "long" });
  if (start.getTime() === end.getTime()) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export async function generateMetadata({ params }: SpecialDatePageProps) {
  const { slug } = await params;
  const specialDate = await getSpecialDateBySlugAction(slug);
  if (!specialDate) {
    return { title: "Fecha no encontrada | Encanto Floristería" };
  }
  return {
    title: `${specialDate.name} | Encanto Floristería`,
    description:
      specialDate.warningMessage ||
      `Catálogo especial para ${specialDate.name}. Descubre arreglos florales únicos.`,
  };
}

export default async function SpecialDatePage({ params, searchParams }: SpecialDatePageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const limit = 12;

  const specialDate = await getSpecialDateBySlugAction(slug);
  if (!specialDate) notFound();

  const { result: products, meta } = await api.products.list({
    page,
    limit,
    isActive: true,
    specialDateSlug: slug,
  });

  return (
    <div className="min-h-screen bg-background-alt">
      <Breadcrumb
        items={[
          { label: "Fechas Especiales", href: "/" },
          { label: specialDate.name },
        ]}
      />

      {/* Hero Banner 16:9 */}
      <section className="relative w-full aspect-[16/9] max-h-[70vh] bg-section-dark overflow-hidden">
        {specialDate.bannerUrl ? (
          <Image
            src={specialDate.bannerUrl}
            alt={specialDate.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-section-dark" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
            <div className="inline-flex items-center gap-2 bg-primary/90 text-white dark:text-gray-900 px-3 py-1.5 rounded-full mb-4 backdrop-blur-sm">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-normal">
                {formatDateRange(specialDate.startDate, specialDate.endDate)}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white leading-tight">
              {specialDate.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Warning Message */}
      {specialDate.warningMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p>{specialDate.warningMessage}</p>
              {specialDate.requiresAdvanceDays > 0 && (
                <p className="mt-1 text-amber-700">
                  Requiere {specialDate.requiresAdvanceDays} día
                  {specialDate.requiresAdvanceDays === 1 ? "" : "s"} de anticipación.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <p className="text-foreground-secondary max-w-2xl">
          Catálogo exclusivo para esta fecha especial.
        </p>
        <p className="text-sm text-foreground-muted mt-2">
          {meta.total} {meta.total === 1 ? "producto disponible" : "productos disponibles"}
        </p>
      </div>

      {/* Products Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {meta.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  baseUrl={`/fechas-especiales/${slug}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-foreground-secondary">
              Aún no hay productos disponibles para esta fecha especial.
            </p>
            <Link
              href="/productos"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Ver todos los productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
