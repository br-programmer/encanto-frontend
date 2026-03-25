"use client";

import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  hideFeaturedBadge?: boolean;
  showBorder?: boolean;
}

export function ProductCard({ product, hideFeaturedBadge = false, showBorder = false }: ProductCardProps) {
  const { addItem } = useCartStore();

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.comparePriceCents && product.comparePriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.comparePriceCents!) * 100)
    : 0;

  const isOutOfStock = !product.inStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      image: primaryImage?.url || null,
    });
  };

  return (
    <div
      className={`group relative bg-white dark:bg-stone-900 rounded-sm shadow-md transition-all duration-300 ${isOutOfStock ? "opacity-50" : "hover:shadow-lg hover:-translate-y-1"} ${showBorder ? "border border-secondary" : ""}`}
    >
      {/* Polaroid photo area */}
      <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
        <Link href={`/productos/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-secondary">
          {primaryImage ? (
            <SafeImage
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              fallbackClassName="w-full h-full"
              iconSize="lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-foreground-muted" />
            </div>
          )}

          {/* Badge - left: discount */}
          {hasDiscount && !isOutOfStock && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs">-{discountPercent}%</Badge>
            </div>
          )}

          {/* Badge - right: featured or out of stock */}
          {isOutOfStock ? (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">Agotado</Badge>
            </div>
          ) : product.isFeatured && !hideFeaturedBadge ? (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="text-xs">Destacado</Badge>
            </div>
          ) : null}

          {/* Cart button */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors"
              aria-label="Agregar al carrito"
            >
              <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          )}
        </Link>
      </div>

      {/* Polaroid caption area */}
      <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 text-center">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-normal text-sm sm:text-base text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-medium text-primary">
            {formatPrice(product.priceCents)}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-foreground-muted line-through">
              {formatPrice(product.comparePriceCents!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
