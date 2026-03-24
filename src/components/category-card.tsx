import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categorias/${category.slug}`}
      className="group relative block aspect-[4/3] rounded-xl overflow-hidden bg-secondary"
    >
      {/* Image */}
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
        <div className="w-full h-full bg-gradient-to-br from-secondary to-accent" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white text-lg font-medium">{category.name}</h3>
        {category.description && (
          <p className="text-white/80 text-sm mt-1 line-clamp-2">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
}
