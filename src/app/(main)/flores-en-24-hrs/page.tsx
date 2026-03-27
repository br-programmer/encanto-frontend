import { Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { CollectionFilters } from "@/components/price-filter";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Flores en 24 hrs | Encanto Florería",
  description: "Arreglos florales con entrega en 24 horas en Manta. Pide hoy, recibe mañana.",
};

interface PageProps {
  searchParams: Promise<{ page?: string; minPrice?: string; maxPrice?: string; inStock?: string }>;
}

export default async function FloresEn24HrsPage({ searchParams }: PageProps) {
  const { page: pageParam, minPrice, maxPrice, inStock } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const limit = 12;

  const productsResponse = await api.products.list({
    isActive: true,
    isQuickDelivery: true,
    page,
    limit,
    ...(minPrice ? { minPrice: Math.round(parseFloat(minPrice) * 100) } : {}),
    ...(maxPrice ? { maxPrice: Math.round(parseFloat(maxPrice) * 100) } : {}),
    ...(inStock === "true" ? { inStock: true } : {}),
  });

  const products = productsResponse.result;
  const meta = productsResponse.meta;

  const breadcrumbItems = [
    { label: "Flores en 24 hrs" },
  ];

  return (
    <div className="min-h-screen bg-background-alt">
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-4">
              Flores para mañana
            </h1>
            <p className="text-foreground-secondary text-base sm:text-lg leading-relaxed">
              A veces los mejores detalles son los más espontáneos. Estos arreglos están
              disponibles para entrega al día siguiente en Manta. Haz tu pedido hoy y
              deja que las flores hablen por ti mañana.
            </p>
            <p className="text-foreground-muted text-xs sm:text-sm mt-4 italic">
              Los arreglos pueden presentar ligeras variaciones en tonos o elementos
              según la disponibilidad de flores frescas del día.
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Suspense>
            <CollectionFilters />
          </Suspense>
          <p className="text-sm text-foreground-secondary">
            {meta.total} {meta.total === 1 ? "producto" : "productos"}
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                {page > 1 ? (
                  <Link
                    href={`/flores-en-24-hrs?page=${page - 1}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="w-9 h-9 flex items-center justify-center opacity-30">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "dots")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1]) > 1) acc.push("dots");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    item === "dots" ? (
                      <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-foreground-muted text-sm">
                        ...
                      </span>
                    ) : (
                      <Link
                        key={item}
                        href={`/flores-en-24-hrs?page=${item}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ${
                          page === item
                            ? "bg-primary text-white"
                            : "hover:bg-secondary text-foreground-secondary"
                        }`}
                      >
                        {item}
                      </Link>
                    )
                  )}

                {page < meta.totalPages ? (
                  <Link
                    href={`/flores-en-24-hrs?page=${page + 1}`}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="w-9 h-9 flex items-center justify-center opacity-30">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Clock className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-secondary">
              No hay productos disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
