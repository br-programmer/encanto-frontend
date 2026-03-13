"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, ShoppingBag, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  transferDiscount?: number;
  isLoadingPreview?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  transferDiscount = 0,
  isLoadingPreview = false,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const total = subtotal + shippingCost - transferDiscount;

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Mobile toggle header */}
      <button
        className="w-full flex items-center justify-between p-4 lg:hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span className="font-semibold">Resumen del pedido</span>
          <span className="text-sm text-foreground-secondary">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatPrice(total)}</span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-foreground-secondary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-foreground-secondary" />
          )}
        </div>
      </button>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center gap-2 p-6 border-b border-border">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Resumen del pedido</h2>
        {isLoadingPreview && (
          <Loader2 className="h-4 w-4 animate-spin text-foreground-secondary ml-auto" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "lg:block",
          isExpanded ? "block" : "hidden"
        )}
      >
        {/* Items list */}
        <div className="p-4 lg:p-6 space-y-4 border-b border-border lg:border-b-0">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3">
              {/* Image */}
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                {item.product.image ? (
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-foreground-muted" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/productos/${item.product.slug}`}
                  className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-foreground-secondary text-sm mt-1">
                  Cantidad: {item.quantity}
                </p>
                {/* Add-ons */}
                {item.addOns && item.addOns.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {item.addOns.map((addOn) => (
                      <p key={addOn.addOnId} className="text-xs text-foreground-muted">
                        + {addOn.name} x{addOn.quantity} ({formatPrice(addOn.priceCents * addOn.quantity)})
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {formatPrice(item.product.priceCents * item.quantity)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-foreground-secondary text-xs">
                    {formatPrice(item.product.priceCents)} c/u
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-4 lg:p-6 lg:border-t border-border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">Envío</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-green-600">Gratis</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>
          {transferDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Descuento transferencia</span>
              <span className="text-green-600">-{formatPrice(transferDiscount)}</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
