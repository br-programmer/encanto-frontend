"use client";

import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  hideFeaturedBadge?: boolean;
}

export function ProductCard({ product, hideFeaturedBadge = false }: ProductCardProps) {
  const { addItem } = useCartStore();

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.comparePriceCents && product.comparePriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.comparePriceCents!) * 100)
    : 0;

  const isOutOfStock = !product.inStock;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      image: primaryImage?.url || null,
    });
  };

  return (
    <div className="group relative bg-background rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square overflow-hidden bg-secondary">
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

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">-{discountPercent}%</Badge>
          )}
          {product.isFeatured && !hideFeaturedBadge && (
            <Badge variant="default" className="text-xs">Destacado</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="text-xs">Agotado</Badge>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-normal text-sm sm:text-base text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-medium text-primary">
            {formatPrice(product.priceCents)}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-foreground-muted line-through">
              {formatPrice(product.comparePriceCents!)}
            </span>
          )}
        </div>

        <Button
          className="w-full mt-3 sm:mt-4 h-10 sm:h-11"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          <span className="text-sm">{isOutOfStock ? "Agotado" : "Agregar"}</span>
        </Button>
      </div>
    </div>
  );
}
