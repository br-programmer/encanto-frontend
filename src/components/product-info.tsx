"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Check, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import { formatPrice, calculateDiscount, isInStock, getPrimaryImage } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { addToast } = useToast();

  const discount = calculateDiscount(product.priceCents, product.comparePriceCents);
  const stock = product.stock ?? product.inventory?.quantity ?? 0;
  const inStock = isInStock(stock);
  const primaryImage = getPrimaryImage(product.images);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (newValue > stock) return stock;
      return newValue;
    });
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        image: primaryImage,
      });
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    addToast(
      quantity > 1
        ? `${quantity} ${product.name} agregados al carrito`
        : `${product.name} agregado al carrito`,
      "cart"
    );
    openCart();
  };

  return (
    <div className="flex flex-col">
      {/* Category */}
      {product.category && (
        <Link
          href={`/categorias/${product.category.slug}`}
          className="text-sm text-primary hover:underline mb-2"
        >
          {product.category.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="text-3xl font-serif">{product.name}</h1>

      {/* Badges */}
      <div className="flex gap-2 mt-3">
        {discount && <Badge variant="destructive">-{discount}% OFF</Badge>}
        {product.isFeatured && <Badge variant="default">Destacado</Badge>}
        {!inStock && <Badge variant="secondary">Agotado</Badge>}
      </div>

      {/* Price */}
      <div className="mt-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(product.priceCents)}
          </span>
          {product.comparePriceCents && (
            <span className="text-lg text-foreground-muted line-through">
              {formatPrice(product.comparePriceCents)}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-6">
          <p className="text-foreground-secondary leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Stock Status */}
      <div className="mt-6 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            inStock ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-foreground-secondary">
          {inStock ? `${stock} disponibles` : "Sin stock"}
        </span>
      </div>

      {/* Quantity Selector & Add to Cart */}
      {inStock && (
        <div className="mt-6 space-y-4">
          {/* Quantity */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm font-medium">Cantidad:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
                className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isAdded}
          >
            {isAdded ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Agregado al carrito
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Agregar al carrito
              </>
            )}
          </Button>
        </div>
      )}

      {/* Shipping Info */}
      <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">Envío el mismo día</p>
            <p className="text-sm text-foreground-secondary mt-1">
              Pedidos antes de las 2pm se entregan el mismo día en Manta.
            </p>
          </div>
        </div>
      </div>

      {/* SKU */}
      {product.sku && (
        <p className="mt-6 text-xs text-foreground-muted">SKU: {product.sku}</p>
      )}
    </div>
  );
}
