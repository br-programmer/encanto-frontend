import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { CategoryCard } from "@/components/category-card";

export const metadata = {
  title: "Categorías | Encanto Florería",
  description: "Explora nuestra colección de flores y arreglos florales por categoría.",
};

export default async function CategoriasPage() {
  const { result: categories } = await api.categories.list({
    isActive: true,
    rootOnly: true,
    limit: 100,
  });

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Categorías" }]} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-serif">Categorías</h1>
        <p className="text-foreground-secondary mt-2">
          Encuentra el arreglo perfecto para cada ocasión
        </p>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-foreground-secondary">
              No hay categorías disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
