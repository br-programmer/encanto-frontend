"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";
import { ChevronDown, ChevronUp, ShoppingBag, Loader2, Clock } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";
import type { OrderPreview } from "@/lib/api";

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining} min`;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  transferDiscount?: number;
  isLoadingPreview?: boolean;
  isPickup?: boolean;
  preview?: OrderPreview | null;
  forceExpanded?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  transferDiscount = 0,
  isLoadingPreview = false,
  isPickup = false,
  preview,
  forceExpanded = false,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expanded = forceExpanded || isExpanded;

  const displaySubtotal = preview?.subtotalCents ?? subtotal;
  const displayAddOns = preview?.addOnsTotalCents ?? 0;
  const displayCardMessage = preview?.cardMessageTotalCents ?? 0;
  const displayShipping = isPickup ? 0 : (preview?.deliveryFeeCents ?? shippingCost);
  const displayDiscount = preview?.transferDiscountCents ?? transferDiscount;
  const displayCodeDiscount = preview?.discountAmountCents ?? 0;
  const displayTax = preview?.taxCents ?? 0;
  const total = preview?.totalCents ?? (displaySubtotal + displayAddOns + displayCardMessage + displayShipping - displayDiscount + displayTax);

  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {/* Mobile toggle header */}
      <button
        className="w-full flex items-center justify-between p-4 lg:hidden"
        onClick={() => setIsExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <span className="font-medium">Resumen del pedido</span>
          <span className="text-sm text-foreground-secondary">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatPrice(total)}</span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-foreground-secondary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-foreground-secondary" />
          )}
        </div>
      </button>

      {/* Desktop header */}
      <div className="hidden lg:flex items-center gap-2 p-6 border-b border-border">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="font-medium text-lg">Resumen del pedido</h2>
        {isLoadingPreview && (
          <Loader2 className="h-4 w-4 animate-spin text-foreground-secondary ml-auto" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "lg:block",
          expanded ? "block" : "hidden"
        )}
      >
        {/* Items list */}
        <div className="p-4 lg:p-6 space-y-4 border-b border-border lg:border-b-0">
          {items.map((item) => {
            const previewItem = preview?.items.find((p) => p.productId === item.product.id);

            return (
              <div key={item.product.id} className="flex gap-3">
                {/* Image */}
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                  {item.product.image ? (
                    <SafeImage
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      fallbackClassName="w-full h-full"
                      iconSize="md"
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
                    className="font-normal text-sm hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-foreground-secondary text-sm mt-1">
                    Cantidad: {item.quantity}
                  </p>
                  {/* Add-ons */}
                  {previewItem && previewItem.addOns.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {previewItem.addOns.map((addOn) => (
                        <p key={addOn.addOnId} className="text-xs text-foreground-muted">
                          + {addOn.name} x{addOn.quantity} ({formatPrice(addOn.lineTotalCents)})
                        </p>
                      ))}
                    </div>
                  ) : item.addOns && item.addOns.length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {item.addOns.map((addOn) => (
                        <p key={addOn.addOnId} className="text-xs text-foreground-muted">
                          + {addOn.name} x{addOn.quantity} ({formatPrice(addOn.priceCents * addOn.quantity)})
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Price - use preview price if available */}
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {formatPrice(previewItem?.lineTotalCents ?? item.product.priceCents * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-foreground-secondary text-xs">
                      {formatPrice(previewItem?.unitPriceCents ?? item.product.priceCents)} c/u
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="p-4 lg:p-6 lg:border-t border-border space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">Subtotal</span>
            <span>{formatPrice(displaySubtotal)}</span>
          </div>
          {displayAddOns > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Complementos</span>
              <span>{formatPrice(displayAddOns)}</span>
            </div>
          )}
          {displayCardMessage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Tarjeta de mensaje</span>
              <span>{formatPrice(displayCardMessage)}</span>
            </div>
          )}
          {preview && !isPickup ? (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Envío</span>
              <span>
                {displayShipping === 0 ? (
                  <span className="text-green-600">Gratis</span>
                ) : (
                  formatPrice(displayShipping)
                )}
              </span>
            </div>
          ) : null}
          {displayDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Descuento transferencia</span>
              <span className="text-green-600">-{formatPrice(displayDiscount)}</span>
            </div>
          )}
          {displayCodeDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Código de descuento</span>
              <span className="text-green-600">-{formatPrice(displayCodeDiscount)}</span>
            </div>
          )}
          {displayTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">IVA (15%)</span>
              <span>{formatPrice(displayTax)}</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between font-medium text-lg">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>

          {/* Time estimate breakdown */}
          {preview?.timeEstimate && preview.timeEstimate.totalEstimatedMinutes > 0 && (
            <div className="pt-3 mt-1 border-t border-border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Tiempo estimado: ~{formatTime(preview.timeEstimate.totalEstimatedMinutes)}</span>
              </div>
              <div className="ml-6 mt-1.5 space-y-1 text-xs text-foreground-secondary">
                {preview.timeEstimate.queueWaitMinutes > 0 && (
                  <div className="flex justify-between">
                    <span>Cola de espera</span>
                    <span className="font-normal">~{formatTime(preview.timeEstimate.queueWaitMinutes)}</span>
                  </div>
                )}
                {preview.timeEstimate.preparationMinutes > 0 && (
                  <div className="flex justify-between">
                    <span>Preparación</span>
                    <span className="font-normal">~{formatTime(preview.timeEstimate.preparationMinutes)}</span>
                  </div>
                )}
                {!isPickup && preview.timeEstimate.travelMinutes > 0 && (
                  <div className="flex justify-between">
                    <span>Traslado</span>
                    <span className="font-normal">~{formatTime(preview.timeEstimate.travelMinutes)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
