"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";

interface OrderDetails {
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  zone: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: string;
  notes?: string;
  isSurprise?: boolean;
}

interface CheckoutSuccessProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  orderDetails: OrderDetails;
  onNewOrder: () => void;
}

export function CheckoutSuccess({
  items,
  subtotal,
  shippingCost,
  orderDetails,
  onNewOrder,
}: CheckoutSuccessProps) {
  const total = subtotal + shippingCost;

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "transfer":
        return "Transferencia bancaria";
      case "cash":
        return "Efectivo contra entrega";
      case "card":
        return "Tarjeta de crédito/débito";
      default:
        return method;
    }
  };

  const formatDeliveryTime = (time: string) => {
    switch (time) {
      case "morning":
        return "9:00 AM - 12:00 PM";
      case "noon":
        return "12:00 PM - 3:00 PM";
      case "afternoon":
        return "3:00 PM - 7:00 PM";
      default:
        return time;
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif mb-2">¡Pedido recibido!</h1>
          <p className="text-foreground-secondary text-lg">
            Gracias por tu compra. Te contactaremos pronto para confirmar los detalles.
          </p>
        </div>

        {/* Order summary card */}
        <div className="bg-background rounded-xl border border-border overflow-hidden mb-6">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Detalles del pedido</h2>
            </div>
            <p className="text-sm text-foreground-secondary">
              Número de pedido: #{Date.now().toString().slice(-8)}
            </p>
          </div>

          {/* Delivery info */}
          <div className="p-6 border-b border-border">
            <h3 className="font-medium mb-4">Información de entrega</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground-secondary">Destinatario</p>
                <p className="font-medium">{orderDetails.recipientName}</p>
              </div>
              <div>
                <p className="text-foreground-secondary">Teléfono</p>
                <p className="font-medium">{orderDetails.recipientPhone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-foreground-secondary">Dirección</p>
                <p className="font-medium">
                  {orderDetails.address}, {orderDetails.zone}, {orderDetails.city}
                </p>
              </div>
              <div>
                <p className="text-foreground-secondary">Fecha de entrega</p>
                <p className="font-medium">
                  {new Date(orderDetails.deliveryDate + "T00:00:00").toLocaleDateString("es-EC", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-foreground-secondary">Horario</p>
                <p className="font-medium">{formatDeliveryTime(orderDetails.deliveryTime)}</p>
              </div>
              <div>
                <p className="text-foreground-secondary">Método de pago</p>
                <p className="font-medium">{getPaymentMethodLabel(orderDetails.paymentMethod)}</p>
              </div>
              {orderDetails.isSurprise && (
                <div>
                  <p className="text-foreground-secondary">Tipo de entrega</p>
                  <p className="font-medium text-primary">Entrega sorpresa</p>
                </div>
              )}
            </div>
            {orderDetails.notes && (
              <div className="mt-4">
                <p className="text-foreground-secondary text-sm">Notas adicionales</p>
                <p className="text-sm mt-1">{orderDetails.notes}</p>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="p-6 border-b border-border">
            <h3 className="font-medium mb-4">Productos</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 text-foreground-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-foreground-secondary">Cantidad: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.product.priceCents * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-6 space-y-2">
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
            <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Next steps info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-amber-800 mb-2">Próximos pasos</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Te contactaremos por WhatsApp para confirmar tu pedido</li>
            <li>• Recibirás instrucciones de pago si elegiste transferencia</li>
            <li>• El día de la entrega, nuestro repartidor se comunicará contigo</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/productos">
              Seguir comprando
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://wa.me/593982742191?text=Hola!%20Acabo%20de%20realizar%20un%20pedido"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
