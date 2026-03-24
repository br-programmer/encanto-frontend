"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Package, ArrowRight, Upload, Loader2, Building2, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { uploadTransferProofAction } from "@/actions/order-actions";
import type { Order, BankAccount, OrderSettings, DeliveryTimeSlot } from "@/lib/api";

interface CheckoutSuccessProps {
  order: Order;
  bankAccounts: BankAccount[];
  orderSettings: OrderSettings | null;
  timeSlots: DeliveryTimeSlot[];
  onNewOrder: () => void;
}

export function CheckoutSuccess({
  order,
  bankAccounts,
  orderSettings,
  timeSlots,
  onNewOrder,
}: CheckoutSuccessProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: "Transferencia bancaria",
      paypal: "PayPal",
      datafast: "Tarjeta de crédito/débito",
    };
    return labels[method] || method;
  };

  const getTimeSlotLabel = (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);
    if (!slot) return slotId;
    const formatTime = (t: string) => {
      const [h, m] = t.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${m} ${ampm}`;
    };
    return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const accessToken = (() => {
        try {
          const tokens = localStorage.getItem("encanto-tokens");
          if (tokens) return JSON.parse(tokens).accessToken;
        } catch { /* ignore */ }
        return undefined;
      })();
      const guestToken = localStorage.getItem("encanto-guest-token") || undefined;

      const formData = new FormData();
      formData.append("file", file);

      await uploadTransferProofAction(order.id, formData, accessToken, guestToken);
      setUploadSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al subir el comprobante";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyAccount = async (accountNumber: string, accountId: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountId);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const isTransfer = order.paymentMethod === "bank_transfer";

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif mb-2">
            {order.paymentStatus === "paid" ? "¡Pago confirmado!" : "¡Pedido recibido!"}
          </h1>
          <p className="text-foreground-secondary text-lg">
            {order.paymentStatus === "paid"
              ? "Tu pago ha sido confirmado. Te contactaremos pronto para confirmar los detalles."
              : isTransfer
                ? "Realiza la transferencia y sube tu comprobante para confirmar el pedido."
                : "Gracias por tu compra. Te contactaremos pronto para confirmar los detalles."}
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
              Número de pedido: <span className="font-medium text-foreground">{order.orderNumber}</span>
            </p>
          </div>

          {/* Delivery/Pickup info */}
          <div className="p-6 border-b border-border">
            <h3 className="font-medium mb-4">
              {order.fulfillmentType === "pickup" ? "Información de retiro" : "Información de entrega"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground-secondary">
                  {order.fulfillmentType === "pickup" ? "Quien retira" : "Destinatario"}
                </p>
                <p className="font-medium">{order.recipientName}</p>
              </div>
              {order.recipientPhone && (
                <div>
                  <p className="text-foreground-secondary">Teléfono</p>
                  <p className="font-medium">{order.recipientPhone}</p>
                </div>
              )}
              {order.fulfillmentType !== "pickup" && order.deliveryAddress && (
                <div className="sm:col-span-2">
                  <p className="text-foreground-secondary">Dirección</p>
                  <p className="font-medium">
                    {order.deliveryAddress}{order.deliveryCity ? `, ${order.deliveryCity}` : ""}
                  </p>
                </div>
              )}
              <div>
                <p className="text-foreground-secondary">
                  {order.fulfillmentType === "pickup" ? "Fecha de retiro" : "Fecha de entrega"}
                </p>
                <p className="font-medium">
                  {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString("es-EC", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-foreground-secondary">Horario</p>
                <p className="font-medium">{getTimeSlotLabel(order.deliveryTimeSlotId)}</p>
              </div>
              <div>
                <p className="text-foreground-secondary">Método de pago</p>
                <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
              </div>
              {order.fulfillmentType !== "pickup" && order.isSurprise && (
                <div>
                  <p className="text-foreground-secondary">Tipo de entrega</p>
                  <p className="font-medium text-primary">Entrega sorpresa</p>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="p-6 border-b border-border">
            <h3 className="font-medium mb-4">Productos</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.productNameSnapshot}</p>
                    <p className="text-xs text-foreground-secondary">Cantidad: {item.quantity}</p>
                    {item.addOns.length > 0 && (
                      <div className="mt-1">
                        {item.addOns.map((addOn) => (
                          <p key={addOn.id} className="text-xs text-foreground-muted">
                            + {addOn.addOnNameSnapshot} x{addOn.quantity}
                          </p>
                        ))}
                      </div>
                    )}
                    {item.cardMessage && (
                      <p className="text-xs text-foreground-muted mt-1 italic">
                        &quot;{item.cardMessage}&quot;
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.lineTotalCents)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="p-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Subtotal</span>
              <span>{formatPrice(order.subtotalCents)}</span>
            </div>
            {order.addOnsTotalCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">Complementos</span>
                <span>{formatPrice(order.addOnsTotalCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">
                {order.fulfillmentType === "pickup" ? "Retiro en tienda" : "Envío"}
              </span>
              <span>
                {order.fulfillmentType === "pickup" || order.deliveryFeeCents === 0 ? (
                  <span className="text-green-600">{order.fulfillmentType === "pickup" ? "$0.00" : "Gratis"}</span>
                ) : (
                  formatPrice(order.deliveryFeeCents)
                )}
              </span>
            </div>
            {order.transferDiscountCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Descuento transferencia</span>
                <span className="text-green-600">-{formatPrice(order.transferDiscountCents)}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Bank transfer: show accounts and upload */}
        {isTransfer && (
          <div className="bg-background rounded-xl border border-border overflow-hidden mb-6">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Datos para transferencia</h3>
              </div>
              <p className="text-sm text-foreground-secondary">
                Realiza la transferencia por <span className="font-semibold text-primary">{formatPrice(order.totalCents)}</span> a cualquiera de estas cuentas:
              </p>
            </div>

            <div className="p-6 space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <div className="flex items-start justify-between">
                    <div className="text-sm">
                      <p className="font-medium">{account.bankName}</p>
                      <p className="text-foreground-secondary">
                        {account.accountType === "savings" ? "Ahorros" : "Corriente"} — {account.accountNumber}
                      </p>
                      <p className="text-foreground-secondary">{account.beneficiary}</p>
                      <p className="text-foreground-secondary">
                        {account.documentType === "cedula" ? "C.I." : "RUC"}: {account.documentNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopyAccount(account.accountNumber, account.id)}
                      className="p-2 hover:bg-secondary rounded-md transition-colors"
                      title="Copiar número de cuenta"
                    >
                      {copiedAccount === account.id ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-foreground-secondary" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload proof */}
            <div className="p-6 border-t border-border">
              <h3 className="font-medium mb-3">Subir comprobante de pago</h3>
              {uploadSuccess ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    Comprobante subido exitosamente. Verificaremos tu pago pronto.
                  </p>
                </div>
              ) : (
                <>
                  <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <span className="text-sm text-foreground-secondary">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-foreground-muted" />
                        <span className="text-sm text-foreground-secondary">
                          Haz clic para subir imagen o PDF del comprobante
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleUploadProof}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  {uploadError && (
                    <p className="text-sm text-destructive mt-2">{uploadError}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Next steps info */}
        {!isTransfer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-amber-800 mb-2">Próximos pasos</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>Te contactaremos por WhatsApp para confirmar tu pedido</li>
              {order.fulfillmentType === "pickup" ? (
                <li>Te notificaremos cuando tu pedido esté listo para retirar</li>
              ) : (
                <li>El día de la entrega, nuestro repartidor se comunicará contigo</li>
              )}
            </ul>
          </div>
        )}

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
