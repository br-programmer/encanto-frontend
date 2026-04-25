"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, FileText, CheckCircle2, XCircle, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useToast } from "@/components/ui/toast";
import {
  getServiceOfferAction,
  acceptServiceOfferAction,
  rejectServiceOfferAction,
} from "@/actions/service-offer-actions";
import { getInvoiceProfilesAction } from "@/actions/invoice-profile-actions";
import { api } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { BUSINESS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import {
  validateDocumentByType,
  DOCUMENT_TYPE_LABELS,
  EC_DOC_TYPES,
  FOREIGN_DOC_TYPES,
  type DocType,
} from "@/lib/ecuadorian-document";
import type {
  ServiceOffer,
  PaymentMethod,
  UserInvoiceProfile,
  InvoiceDocumentType,
  OrderSettings,
} from "@/lib/api";

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

interface BillingState {
  invoiceProfileId: string; // "" | "new" | profile.id | "final_consumer"
  documentType: InvoiceDocumentType;
  documentNumber: string;
  fullName: string;
  email: string;
  address: string;
  phone: string;
}

const EMPTY_BILLING: BillingState = {
  invoiceProfileId: "",
  documentType: "cedula",
  documentNumber: "",
  fullName: "",
  email: "",
  address: "",
  phone: "",
};

export default function OfferDetailPage({ params }: { params: Promise<{ offerNumber: string }> }) {
  const { offerNumber } = use(params);
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [offer, setOffer] = useState<ServiceOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [acceptance, setAcceptance] = useState<{ orderNumber: string; email: string } | null>(null);
  const [profiles, setProfiles] = useState<UserInvoiceProfile[]>([]);
  const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);
  const [billing, setBilling] = useState<BillingState>(EMPTY_BILLING);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const tokens = useAuthStore((s) => s.tokens);
  const accessToken = tokens?.accessToken;
  const isLoggedIn = !!useAuthStore((s) => s.user);

  const getGuestToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("encanto-service-offer-token") ?? undefined : undefined;

  // Initial fetch — offer + (when logged in) profiles + orderSettings
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("encanto-service-offer-token", token);
    }

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const guestToken = token || getGuestToken();
        const [offerData, settings] = await Promise.all([
          getServiceOfferAction(offerNumber, accessToken ?? undefined, guestToken),
          api.orderSettings.get().catch(() => null),
        ]);
        if (cancelled) return;
        setOffer(offerData);
        setOrderSettings(settings);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Error) {
          const msg = err.message.toLowerCase();
          const tokenIssue =
            err.message.startsWith("[401]") ||
            msg.includes("invalidguesttoken") ||
            msg.includes("token de acceso") ||
            msg.includes("token de invitado") ||
            msg.includes("expirado");
          if (tokenIssue) {
            try {
              localStorage.removeItem("encanto-service-offer-token");
            } catch { /* ignore */ }
            setError("expired_token");
          } else if (err.message.includes("404")) {
            setError("not_found");
          } else if (err.message.includes("403") || err.message.includes("401")) {
            setError("no_access");
          } else {
            setError("generic");
          }
        } else {
          setError("generic");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [offerNumber, searchParams, accessToken]);

  // Load saved invoice profiles for logged-in users; pre-fill billing with default
  useEffect(() => {
    if (!accessToken) {
      setProfiles([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const validToken = await useAuthStore.getState().getValidAccessToken();
        if (cancelled || !validToken) return;
        const res = await getInvoiceProfilesAction(validToken, { limit: 50 });
        if (cancelled) return;
        setProfiles(res.result);
        const def = res.result.find((p) => p.isDefault) || res.result[0];
        if (def) {
          setBilling((prev) => prev.invoiceProfileId ? prev : ({
            invoiceProfileId: def.id,
            documentType: def.documentType,
            documentNumber: def.documentNumber,
            fullName: def.fullName,
            email: def.email,
            address: def.address || "",
            phone: def.phone || "",
          }));
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [accessToken]);

  // Total used to enforce final_consumer limit. Backend uses the displayed
  // (non-discounted) total — match that.
  const totalCents = useMemo(() => {
    if (!offer) return 0;
    const isTransfer = paymentMethod === "bank_transfer";
    return isTransfer
      ? offer.subtotalCents + offer.taxCents
      : offer.displaySubtotalCents + offer.displayTaxCents;
  }, [offer, paymentMethod]);

  const finalConsumerLimitCents = orderSettings?.finalConsumerLimitCents;
  const limitReached =
    finalConsumerLimitCents != null && totalCents >= finalConsumerLimitCents;
  const isFinalConsumer = billing.documentType === "final_consumer";
  const isUsingSavedProfile =
    !!billing.invoiceProfileId &&
    billing.invoiceProfileId !== "new" &&
    billing.invoiceProfileId !== "final_consumer";

  const handleSelectProfile = (value: string) => {
    setAcceptError(null);
    if (value === "new") {
      setBilling({
        invoiceProfileId: "new",
        documentType: "cedula",
        documentNumber: "",
        fullName: "",
        email: "",
        address: "",
        phone: "",
      });
      return;
    }
    if (value === "final_consumer") {
      setBilling({
        invoiceProfileId: "final_consumer",
        documentType: "final_consumer",
        documentNumber: "",
        fullName: "",
        email: "",
        address: "",
        phone: "",
      });
      return;
    }
    const p = profiles.find((pp) => pp.id === value);
    if (!p) return;
    setBilling({
      invoiceProfileId: p.id,
      documentType: p.documentType,
      documentNumber: p.documentNumber,
      fullName: p.fullName,
      email: p.email,
      address: p.address || "",
      phone: p.phone || "",
    });
  };

  const validateBilling = (): string | null => {
    if (isFinalConsumer) {
      if (limitReached && finalConsumerLimitCents != null) {
        return `El total supera ${formatPrice(finalConsumerLimitCents)}. Debes identificar al adquirente con cédula, RUC, pasaporte o documento del exterior.`;
      }
      return null;
    }
    if (!billing.fullName.trim()) return "Ingresa el nombre o razón social";
    if (!billing.email.trim()) return "Ingresa el correo para la factura";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(billing.email.trim())) return "Correo de facturación inválido";
    const docCheck = validateDocumentByType(
      billing.documentType as DocType,
      billing.documentNumber.trim()
    );
    if (!docCheck.valid) return docCheck.error || "Documento inválido";
    return null;
  };

  const handleAccept = async () => {
    if (!offer) return;
    const v = validateBilling();
    if (v) {
      setAcceptError(v);
      return;
    }
    setAcceptError(null);
    setIsAccepting(true);
    try {
      const guestToken = getGuestToken();

      const invoicePayload =
        billing.documentType === "final_consumer"
          ? { invoiceDocumentType: "final_consumer" as const }
          : {
              invoiceDocumentType: billing.documentType,
              invoiceDocumentNumber: billing.documentNumber.trim(),
              invoiceFullName: billing.fullName.trim(),
              invoiceEmail: billing.email.trim(),
              ...(billing.address.trim() ? { invoiceAddress: billing.address.trim() } : {}),
              ...(billing.phone.trim() ? { invoicePhone: billing.phone.trim() } : {}),
            };

      // invoiceProfileId only works when the offer is tied to the logged-in
      // user (offer.userId !== null AND matches the JWT). For guest-owned
      // offers, fall back to sending the snapshot fields explicitly — the
      // billing state already has them filled from the selected profile, so
      // the resulting order has the same data either way.
      const offerOwnedByUser = !!offer.userId;
      const useProfileId = isUsingSavedProfile && offerOwnedByUser;
      // For an authenticated request with profileId we drop the guest token
      // so the BE doesn't downgrade to guest mode. For guest offers we keep
      // the guest token (it is the only valid identity).
      const effectiveGuestToken = useProfileId ? undefined : guestToken;

      const result = await acceptServiceOfferAction(
        offer.id,
        {
          paymentMethod,
          ...invoicePayload,
          ...(useProfileId ? { invoiceProfileId: billing.invoiceProfileId } : {}),
        },
        accessToken ?? undefined,
        effectiveGuestToken
      );
      // BE always returns a fresh order-scoped guest token. Persist it so
      // email links and the order detail page can authenticate as guest
      // (parallel to the JWT for logged-in users).
      const orderGuestToken = result.guestToken;
      const newOrderNumber = result.order?.orderNumber ?? result.orderNumber ?? "";
      const newOrderId = result.order?.id ?? result.orderId;
      if (orderGuestToken) {
        localStorage.setItem("encanto-guest-token", orderGuestToken);
      }
      setAcceptance({ orderNumber: newOrderNumber, email: offer.clientEmail });
      setOffer((prev) => (prev ? { ...prev, status: "order_created", orderId: newOrderId ?? null } : prev));
      addToast("Propuesta aceptada", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al aceptar la propuesta";
      const lower = msg.toLowerCase();
      let friendly = msg;
      if (lower.includes("invoicefinalconsumerlimit") || lower.includes("final_consumer")) {
        friendly = "El total supera el límite para consumidor final. Debes identificar al adquirente con cédula, RUC, pasaporte o documento del exterior.";
      } else if (lower.includes("invoiceprofilerequiresauth")) {
        friendly = "Solo usuarios autenticados pueden usar un perfil de facturación guardado.";
      }
      setAcceptError(friendly);
      addToast(friendly, "error");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    setIsRejecting(true);
    try {
      await rejectServiceOfferAction(offer.id, accessToken ?? undefined, getGuestToken());
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
    const isExpired = error === "expired_token";
    const title =
      error === "not_found"
        ? "Propuesta no encontrada"
        : isExpired
          ? "El enlace expiró"
          : error === "no_access"
            ? "Enlace no válido"
            : "Algo salió mal";
    const message =
      error === "not_found"
        ? "No pudimos encontrar esta propuesta. Verifica el enlace o contacta con nosotros."
        : isExpired
          ? "Este enlace solo es válido por unos días. Pídenos uno nuevo por WhatsApp y con gusto te lo enviamos."
          : error === "no_access"
            ? "El enlace para ver esta propuesta no es válido. Revisa tu correo para obtener el enlace original o contáctanos por WhatsApp."
            : "No pudimos cargar la propuesta en este momento. Intenta de nuevo más tarde.";
    const whatsappMsg = isExpired
      ? `Hola! El enlace para ver la propuesta ${offerNumber} expiró, ¿pueden enviarme uno nuevo?`
      : `Hola! No puedo acceder a la propuesta ${offerNumber}`;

    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 text-center">
        {isExpired ? (
          <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        ) : (
          <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-foreground-secondary mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="outline" asChild>
            <a
              href={BUSINESS.whatsapp.url(whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar por WhatsApp
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (acceptance) {
    const paymentLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod;
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-background rounded-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Propuesta aceptada</h1>
          <p className="text-foreground-secondary mb-6">
            Hemos creado la orden{" "}
            <span className="font-medium text-foreground">{acceptance.orderNumber}</span>.
          </p>

          <div className="bg-secondary/30 border border-border rounded-lg p-4 text-left mb-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-normal mb-1">Revisa tu correo</p>
                <p className="text-foreground-secondary">
                  Enviaremos los detalles de la orden y las instrucciones de pago por{" "}
                  <span className="font-medium">{paymentLabel.toLowerCase()}</span> a{" "}
                  <span className="font-medium break-all">{acceptance.email}</span>.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-foreground-secondary mb-6">
            Si tienes alguna consulta, contáctanos por WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={BUSINESS.whatsapp.url(`Hola! Acabo de aceptar la propuesta ${offer.offerNumber}`)}
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

          {/* Invoice / SRI */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Datos de facturación</h3>
            </div>
            <p className="text-sm text-foreground-secondary mb-4">
              Ecuador requiere emisión electrónica de factura. Ingresa los datos del adquirente.
            </p>

            {/* Saved profiles selector (logged-in only) */}
            {isLoggedIn && profiles.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-normal mb-2">Perfil de facturación</label>
                <Select
                  value={billing.invoiceProfileId || ""}
                  onValueChange={handleSelectProfile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir perfil guardado" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {(p.nickname || p.fullName) + " — " + p.documentNumber}
                      </SelectItem>
                    ))}
                    <SelectItem value="new">Ingresar datos manualmente</SelectItem>
                    {!limitReached && (
                      <SelectItem value="final_consumer">Facturar a consumidor final</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Final consumer toggle when no profiles */}
            {(!isLoggedIn || profiles.length === 0) && !limitReached && (
              <label className="flex items-start gap-2 cursor-pointer p-3 rounded-lg bg-secondary/20 border border-border mb-4">
                <Checkbox
                  checked={isFinalConsumer}
                  onCheckedChange={(c) => {
                    if (c === true) {
                      setBilling({
                        invoiceProfileId: "final_consumer",
                        documentType: "final_consumer",
                        documentNumber: "",
                        fullName: "",
                        email: "",
                        address: "",
                        phone: "",
                      });
                    } else {
                      setBilling({
                        invoiceProfileId: "new",
                        documentType: "cedula",
                        documentNumber: "",
                        fullName: "",
                        email: "",
                        address: "",
                        phone: "",
                      });
                    }
                  }}
                />
                <div>
                  <span className="text-sm font-normal">Facturar a consumidor final</span>
                  <p className="text-xs text-foreground-secondary">
                    Disponible para órdenes menores a {formatPrice(finalConsumerLimitCents ?? 5000)}
                  </p>
                </div>
              </label>
            )}

            {limitReached && isFinalConsumer && finalConsumerLimitCents != null && (
              <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                El total supera {formatPrice(finalConsumerLimitCents)} — debes identificar al adquirente con cédula, RUC, pasaporte o documento del exterior.
              </div>
            )}

            {/* Manual form (hidden for saved profile or final consumer) */}
            {!isUsingSavedProfile && !isFinalConsumer && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal mb-2">
                    Tipo de documento <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={
                      billing.documentType === "final_consumer" ? "cedula" : billing.documentType
                    }
                    onValueChange={(v) => setBilling((p) => ({ ...p, documentType: v as DocType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-xs text-foreground-muted uppercase tracking-wide pl-2">
                          Ecuador
                        </SelectLabel>
                        {EC_DOC_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {DOCUMENT_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="text-xs text-foreground-muted uppercase tracking-wide pl-2">
                          Otros
                        </SelectLabel>
                        {FOREIGN_DOC_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {DOCUMENT_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-normal mb-2">
                    Número <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={billing.documentNumber}
                    onChange={(e) => setBilling((p) => ({ ...p, documentNumber: e.target.value }))}
                    placeholder={
                      billing.documentType === "cedula"
                        ? "1712345678"
                        : billing.documentType === "ruc"
                          ? "1712345678001"
                          : billing.documentType === "identificacion_exterior"
                            ? "DNI / NIE / driver's license"
                            : "A1234567"
                    }
                  />
                  {billing.documentType === "identificacion_exterior" && (
                    <p className="text-xs text-foreground-muted mt-1">
                      5–20 caracteres alfanuméricos, espacios y guiones.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-normal mb-2">
                    Nombre / Razón social <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={billing.fullName}
                    onChange={(e) => setBilling((p) => ({ ...p, fullName: e.target.value }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-normal mb-2">
                    Correo <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="email"
                    value={billing.email}
                    onChange={(e) => setBilling((p) => ({ ...p, email: e.target.value }))}
                    placeholder="factura@example.com"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-normal mb-2">Dirección (opcional)</label>
                  <Input
                    value={billing.address}
                    onChange={(e) => setBilling((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-normal mb-2">Teléfono (opcional)</label>
                  <PhoneInput
                    value={billing.phone}
                    onChange={(val) => setBilling((p) => ({ ...p, phone: val }))}
                  />
                </div>
              </div>
            )}

            {isUsingSavedProfile && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border text-sm space-y-1">
                <p>
                  <span className="text-foreground-secondary">Documento:</span>{" "}
                  {DOCUMENT_TYPE_LABELS[billing.documentType as DocType]} — {billing.documentNumber}
                </p>
                <p><span className="text-foreground-secondary">Nombre:</span> {billing.fullName}</p>
                <p><span className="text-foreground-secondary">Correo:</span> {billing.email}</p>
              </div>
            )}
          </div>

          {acceptError && (
            <p className="mt-4 text-sm text-destructive">{acceptError}</p>
          )}

          <Button
            onClick={handleAccept}
            className="w-full mt-6"
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
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={isAccepting || isRejecting}
              className="text-sm text-foreground-secondary hover:text-destructive transition-colors disabled:opacity-50"
            >
              {isRejecting ? "Rechazando..." : "Rechazar propuesta"}
            </button>
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
