import Link from "next/link";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Pagination } from "@/components/pagination";

export const metadata = {
  title: "Productos | Encanto Florería",
  description: "Explora nuestra colección completa de flores y arreglos florales.",
};

interface ProductosPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string | string[];
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    search?: string;
  }>;
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12;

  const selectedSlugs = Array.isArray(params.category)
    ? params.category
    : params.category
      ? [params.category]
      : [];

  // Fetch products and categories in parallel
  const [productsResponse, categoriesResponse] = await Promise.all([
    api.products.list({
      page,
      limit,
      isActive: true,
      categorySlug: selectedSlugs.length > 0 ? selectedSlugs.join(",") : undefined,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      inStock: params.inStock === "true" ? true : undefined,
      search: params.search || undefined,
    }),
    api.categories.list({ isActive: true, rootOnly: true, limit: 100 }),
  ]);

  const { result: products, meta } = productsResponse;
  const { result: categories } = categoriesResponse;

  const selectedCategories = categories.filter((c) => selectedSlugs.includes(c.slug));

  const breadcrumbItems = [
    { label: "Productos", href: selectedCategories.length ? "/productos" : undefined },
    ...(selectedCategories.length === 1 ? [{ label: selectedCategories[0].name }] : []),
    ...(selectedCategories.length > 1 ? [{ label: `${selectedCategories.length} categorías` }] : []),
  ];

  return (
    <div className="min-h-screen bg-background-alt">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-serif">
          {selectedCategories.length === 1
            ? selectedCategories[0].name
            : "Todos los Productos"}
        </h1>
        <p className="text-foreground-secondary mt-2">
          {selectedCategories.length === 1
            ? selectedCategories[0].description || "Encuentra el arreglo perfecto para cada ocasión"
            : "Encuentra el arreglo perfecto para cada ocasión"}
        </p>
        <p className="text-sm text-foreground-muted mt-4">
          {meta.total} {meta.total === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              selectedCategorySlugs={selectedSlugs}
              minPrice={params.minPrice}
              maxPrice={params.maxPrice}
              inStock={params.inStock === "true"}
              search={params.search}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} disableRotation />
                  ))}
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={meta.page}
                      totalPages={meta.totalPages}
                      baseUrl="/productos"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-foreground-secondary">
                  No se encontraron productos con los filtros seleccionados.
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
      </div>
    </div>
  );
}
