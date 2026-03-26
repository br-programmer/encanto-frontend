import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { Flower2 } from "lucide-react";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group block bg-white dark:bg-stone-900 rounded-sm shadow-md border border-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image with polaroid-style padding */}
      <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {category.imageUrl ? (
            <SafeImage
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              fallbackClassName="w-full h-full"
              iconSize="lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Flower2 className="h-12 w-12 text-foreground-muted" />
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 text-center">
        <h3 className="font-serif text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs sm:text-sm text-foreground-secondary mt-1 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
