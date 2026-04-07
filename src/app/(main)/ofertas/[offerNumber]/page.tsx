"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, FileText, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { BUSINESS } from "@/lib/constants";
import type { ServiceOffer, PaymentMethod } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  sent: { label: "Enviada", color: "bg-blue-100 text-blue-800" },
  viewed: { label: "Vista", color: "bg-blue-100 text-blue-800" },
  accepted: { label: "Aceptada", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-800" },
  expired: { label: "Expirada", color: "bg-gray-100 text-gray-800" },
  order_created: { label: "Orden creada", color: "bg-green-100 text-green-800" },
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "Transferencia bancaria",
  paypal: "PayPal",
  datafast: "Tarjeta de crédito/débito",
};

export default function OfferDetailPage({ params }: { params: Promise<{ offerNumber: string }> }) {
  const { offerNumber } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [offer, setOffer] = useState<ServiceOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("encanto-service-offer-token", token);
    }

    async function fetchOffer() {
      setIsLoading(true);
      try {
        const data = await api.serviceOffers.getById(offerNumber);
        setOffer(data);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("404")) setError("not_found");
          else if (err.message.includes("403")) setError("no_access");
          else setError("generic");
        } else {
          setError("generic");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchOffer();
  }, [offerNumber, searchParams]);

  const handleAccept = async () => {
    if (!offer) return;
    setIsAccepting(true);
    try {
      const result = await api.serviceOffers.accept(offer.id, { paymentMethod });
      addToast("Propuesta aceptada. Redirigiendo al pedido...", "success");
      router.push(`/pedidos/${result.orderNumber}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Error al aceptar la propuesta", "error");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    setIsRejecting(true);
    try {
      await api.serviceOffers.reject(offer.id);
      setOffer({ ...offer, status: "rejected" });
      addToast("Propuesta rechazada", "info");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Error al rechazar", "error");
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-5 w-64 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
        <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">
          {error === "not_found" ? "Propuesta no encontrada" : error === "no_access" ? "Sin acceso" : "Error"}
        </h1>
        <p className="text-foreground-secondary mb-6">
          {error === "not_found"
            ? "No pudimos encontrar esta propuesta."
            : error === "no_access"
            ? "No tienes acceso a esta propuesta."
            : "Hubo un error al cargar la propuesta."}
        </p>
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[offer.status] || { label: offer.status, color: "bg-gray-100 text-gray-800" };
  const canAccept = ["sent", "viewed"].includes(offer.status);
  const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();
  const isTransfer = paymentMethod === "bank_transfer";
  const displayTotal = isTransfer
    ? offer.subtotalCents + offer.taxCents
    : offer.displaySubtotalCents + offer.displayTaxCents;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">{offer.offerNumber}</h1>
          </div>
          <p className="text-foreground-secondary text-sm">{offer.title}</p>
        </div>
        <span className={cn("text-sm px-3 py-1.5 rounded-full font-normal", statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>

      {/* Valid until warning */}
      {offer.validUntil && canAccept && (
        <div className={cn(
          "rounded-xl p-4 mb-6 flex items-start gap-3",
          isExpired ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"
        )}>
          <Clock className={cn("h-5 w-5 flex-shrink-0 mt-0.5", isExpired ? "text-red-600" : "text-amber-600")} />
          <p className={cn("text-sm", isExpired ? "text-red-800" : "text-amber-800")}>
            {isExpired
              ? "Esta propuesta ha expirado."
              : `Válida hasta el ${new Date(offer.validUntil).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}`}
          </p>
        </div>
      )}

      {/* Description */}
      {offer.description && (
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <p className="text-sm text-foreground-secondary whitespace-pre-line">{offer.description}</p>
        </div>
      )}

      {/* Event date */}
      {offer.eventDate && (
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-2">Fecha del evento</h2>
          <p className="text-sm text-foreground-secondary">
            {new Date(offer.eventDate + "T00:00:00").toLocaleDateString("es-EC", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="bg-background rounded-xl border border-border p-6 mb-6">
        <h2 className="font-medium mb-4">Detalle de la propuesta</h2>
        <div className="space-y-3">
          {offer.items.sort((a, b) => a.displayOrder - b.displayOrder).map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <div className="flex-1">
                <p className="font-normal">{item.description}</p>
                <p className="text-xs text-foreground-muted">
                  {item.quantity} x {formatPrice(item.unitPriceCents)}
                </p>
              </div>
              <p className="font-normal flex-shrink-0">{formatPrice(item.totalPriceCents)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground-secondary">Subtotal</span>
            <span>{formatPrice(isTransfer ? offer.subtotalCents : offer.displaySubtotalCents)}</span>
          </div>
          {(isTransfer ? offer.taxCents : offer.displayTaxCents) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">IVA (15%)</span>
              <span>{formatPrice(isTransfer ? offer.taxCents : offer.displayTaxCents)}</span>
            </div>
          )}
          {isTransfer && offer.displaySubtotalCents > offer.subtotalCents && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Descuento por transferencia</span>
              <span className="text-green-600">
                -{formatPrice((offer.displaySubtotalCents + offer.displayTaxCents) - (offer.subtotalCents + offer.taxCents))}
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium text-lg border-t border-border pt-2">
            <span>Total</span>
            <span className="text-primary">{formatPrice(displayTotal)}</span>
          </div>
        </div>
      </div>

      {/* Accept/Reject */}
      {canAccept && !isExpired && (
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">Método de pago</h2>

          <div className="space-y-2 mb-6">
            {(["bank_transfer", "paypal", "datafast"] as PaymentMethod[]).map((method) => (
              <label
                key={method}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  paymentMethod === method ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="text-primary focus:ring-primary/20"
                />
                <div className="flex-1">
                  <p className="text-sm font-normal">{PAYMENT_LABELS[method]}</p>
                  {method === "bank_transfer" && offer.displaySubtotalCents > offer.subtotalCents && (
                    <p className="text-xs text-green-600">Precio especial por transferencia</p>
                  )}
                </div>
                <p className="text-sm font-medium">
                  {formatPrice(
                    method === "bank_transfer"
                      ? offer.subtotalCents + offer.taxCents
                      : offer.displaySubtotalCents + offer.displayTaxCents
                  )}
                </p>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAccept}
              className="flex-1"
              disabled={isAccepting || isRejecting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aceptando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aceptar propuesta
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isAccepting || isRejecting}
              className="text-destructive hover:text-destructive"
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Already accepted */}
      {offer.status === "accepted" || offer.status === "order_created" ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800 font-normal">
              Propuesta aceptada.{" "}
              {offer.orderId && (
                <Link href={`/pedidos/${offer.offerNumber.replace("SOF", "ENC")}`} className="underline">
                  Ver pedido
                </Link>
              )}
            </p>
          </div>
        </div>
      ) : null}

      {/* Rejected */}
      {offer.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800 font-normal">Has rechazado esta propuesta.</p>
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="text-center">
        <p className="text-sm text-foreground-secondary mb-3">¿Tienes dudas sobre esta propuesta?</p>
        <Button variant="outline" asChild>
          <a
            href={BUSINESS.whatsapp.url(`Hola! Tengo una consulta sobre la propuesta ${offer.offerNumber}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
