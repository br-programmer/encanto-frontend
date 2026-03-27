"use client";

import { Loader2, ChevronLeft, Pencil, MapPin, CalendarDays, CreditCard, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import type { OrderPreview } from "@/lib/api";
import type { CartItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface StepReviewProps {
  formData: {
    fulfillmentType: string;
    recipientName: string;
    recipientPhone: string;
    address: string;
    deliveryReference: string;
    deliveryDate: string;
    deliveryTimeSlotId: string;
    paymentMethod: string;
    isSurprise: boolean;
    isAnonymous: boolean;
  };
  items: CartItem[];
  preview: OrderPreview | null;
  isLoadingPreview: boolean;
  isSubmitting: boolean;
  cityName: string;
  zoneName: string;
  branchName: string;
  timeSlotLabel: string;
  paymentMethodLabel: string;
  discountCode: string | null;
  error: string | null;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function StepReview({
  formData,
  items,
  preview,
  isLoadingPreview,
  isSubmitting,
  cityName,
  zoneName,
  branchName,
  timeSlotLabel,
  paymentMethodLabel,
  discountCode,
  error,
  onGoToStep,
  onSubmit,
  onBack,
}: StepReviewProps) {
  const isPickup = formData.fulfillmentType === "pickup";
  const subtotal = preview?.subtotalCents ?? 0;
  const addOns = preview?.addOnsTotalCents ?? 0;
  const cardMessage = preview?.cardMessageTotalCents ?? 0;
  const shipping = isPickup ? 0 : (preview?.deliveryFeeCents ?? 0);
  const transferDiscount = preview?.transferDiscountCents ?? 0;
  const codeDiscount = preview?.discountAmountCents ?? 0;
  const tax = preview?.taxCents ?? 0;
  const total = preview?.totalCents ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-normal">Resumen de tu pedido</h2>

      {/* Delivery info */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-normal">
            {isPickup ? <Store className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
            {isPickup ? "Retiro en tienda" : "Entrega a domicilio"}
          </div>
          <button type="button" onClick={() => onGoToStep(1)} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Editar
          </button>
        </div>
        <div className="text-sm text-foreground-secondary space-y-1">
          <p>{formData.recipientName} {formData.recipientPhone ? `— ${formData.recipientPhone}` : ""}</p>
          {isPickup && branchName && <p>Sucursal: {branchName}</p>}
          {!isPickup && <p>{formData.address}{cityName ? `, ${cityName}` : ""}</p>}
          {!isPickup && zoneName && <p>Zona: {zoneName}</p>}
          {!isPickup && formData.isSurprise && <p className="text-primary text-xs">Entrega sorpresa</p>}
          {!isPickup && formData.isAnonymous && <p className="text-primary text-xs">Envío anónimo</p>}
        </div>
      </div>

      {/* Schedule */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-normal">
            <CalendarDays className="h-4 w-4 text-primary" />
            Fecha y horario
          </div>
          <button type="button" onClick={() => onGoToStep(2)} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Editar
          </button>
        </div>
        <div className="text-sm text-foreground-secondary space-y-1">
          <p>{formData.deliveryDate ? new Date(formData.deliveryDate + "T00:00:00").toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}</p>
          <p>{timeSlotLabel || "—"}</p>
        </div>
      </div>

      {/* Payment */}
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-normal">
            <CreditCard className="h-4 w-4 text-primary" />
            Método de pago
          </div>
          <button type="button" onClick={() => onGoToStep(3)} className="text-xs text-primary hover:underline flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Editar
          </button>
        </div>
        <div className="text-sm text-foreground-secondary">
          <p>{paymentMethodLabel}</p>
          {discountCode && <p className="text-green-600 text-xs mt-1">Código: {discountCode}</p>}
        </div>
      </div>

      {/* Products */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-normal mb-3">Productos</h3>
        <div className="space-y-3">
          {items.map((item) => {
            const previewItem = preview?.items.find((p) => p.productId === item.product.id);
            return (
              <div key={item.product.id} className="flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden bg-secondary flex-shrink-0">
                  {item.product.image ? (
                    <SafeImage src={item.product.image} alt={item.product.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal truncate">{item.product.name}</p>
                  <p className="text-xs text-foreground-secondary">x{item.quantity}</p>
                  {item.addOns && item.addOns.length > 0 && (
                    <div className="mt-0.5">
                      {item.addOns.map((a) => (
                        <p key={a.addOnId} className="text-xs text-foreground-muted">+ {a.name}</p>
                      ))}
                    </div>
                  )}
                  {item.cardMessage && <p className="text-xs text-foreground-muted italic mt-0.5">&ldquo;{item.cardMessage}&rdquo;</p>}
                </div>
                <p className="text-sm font-normal flex-shrink-0">
                  {formatPrice(previewItem?.lineTotalCents ?? item.product.priceCents * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Totals */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        {isLoadingPreview ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {addOns > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">Complementos</span>
                <span>{formatPrice(addOns)}</span>
              </div>
            )}
            {cardMessage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">Tarjeta de mensaje</span>
                <span>{formatPrice(cardMessage)}</span>
              </div>
            )}
            {!isPickup && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">Envío</span>
                <span>{shipping === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shipping)}</span>
              </div>
            )}
            {transferDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Descuento transferencia</span>
                <span className="text-green-600">-{formatPrice(transferDiscount)}</span>
              </div>
            )}
            {codeDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Código de descuento</span>
                <span className="text-green-600">-{formatPrice(codeDiscount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">IVA (15%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between font-normal text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="h-12" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1 h-12 text-base"
          onClick={onSubmit}
          disabled={isSubmitting || isLoadingPreview}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            "Confirmar pedido"
          )}
        </Button>
      </div>
      <p className="text-xs text-foreground-secondary text-center">
        Al confirmar, aceptas nuestras políticas de envío y devolución
      </p>
    </div>
  );
}
