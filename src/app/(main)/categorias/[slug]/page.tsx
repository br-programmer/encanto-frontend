import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/product-card";
import { Pagination } from "@/components/pagination";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;

  try {
    const category = await api.categories.getBySlug(slug);
    return {
      title: `${category.name} | Encanto Floristería`,
      description: category.description || `Explora nuestra colección de ${category.name.toLowerCase()}.`,
    };
  } catch {
    return {
      title: "Categoría no encontrada | Encanto Floristería",
    };
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const limit = 12;

  let category;
  try {
    category = await api.categories.getBySlug(slug);
  } catch {
    notFound();
  }

  const { result: products, meta } = await api.products.byCategory(category.id, {
    page,
    limit,
  });

  return (
    <div className="min-h-screen bg-background-alt">
      <Breadcrumb
        items={[
          { label: "Categorías", href: "/categorias" },
          { label: category.name },
        ]}
      />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-serif">{category.name}</h1>
        {category.description && (
          <p className="text-foreground-secondary mt-2 max-w-2xl">
            {category.description}
          </p>
        )}
        <p className="text-sm text-foreground-muted mt-4">
          {meta.total} {meta.total === 1 ? "producto" : "productos"}
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

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  baseUrl={`/categorias/${slug}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-foreground-secondary">
              No hay productos disponibles en esta categoría.
            </p>
            <Link
              href="/categorias"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Ver todas las categorías
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
