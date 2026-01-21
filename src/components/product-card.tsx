"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.comparePriceCents && product.comparePriceCents > product.priceCents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.priceCents / product.comparePriceCents!) * 100)
    : 0;

  const isOutOfStock = product.inventory?.quantity === 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      image: primaryImage?.url || null,
    });
    openCart();
  };

  return (
    <div className="group relative bg-white rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-lg">
      {/* Image */}
      <Link href={`/productos/${product.slug}`} className="block relative aspect-square overflow-hidden bg-secondary">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-foreground-muted" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercent}%</Badge>
          )}
          {product.isFeatured && (
            <Badge variant="default">Destacado</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary">Agotado</Badge>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">
            {formatPrice(product.priceCents)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-foreground-muted line-through">
              {formatPrice(product.comparePriceCents!)}
            </span>
          )}
        </div>

        <Button
          className="w-full mt-4"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Agotado" : "Agregar"}
        </Button>
      </div>
    </div>
  );
}
