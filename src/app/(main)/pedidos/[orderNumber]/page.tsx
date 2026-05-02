"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, Package, ChevronLeft, AlertTriangle, Phone, Bike, Car, User, CreditCard, Gift, EyeOff, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { TransferProofUpload } from "@/components/orders/transfer-proof-upload";
import { PayPalProvider } from "@/components/checkout/paypal-provider";
import { PayPalCheckoutModal } from "@/components/checkout/paypal-checkout";
import { getOrderByOrderNumberAction, cancelOrderAction, getOrderPageDataAction, claimGuestOrdersAction } from "@/actions/order-actions";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatPhone, cn } from "@/lib/utils";
import type { Order, BankAccount, DeliveryTimeSlot } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/date";

const STATUS_COLOR = "bg-primary/10 text-primary";
const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Pendiente de pago", color: STATUS_COLOR },
  paid: { label: "Pagado", color: STATUS_COLOR },
  preparing: { label: "En preparación", color: STATUS_COLOR },
  delivery_assigned: { label: "Repartidor asignado", color: STATUS_COLOR },
  out_for_delivery: { label: "En camino", color: STATUS_COLOR },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800" },
  ready_for_pickup: { label: "Listo para retirar", color: STATUS_COLOR },
  picked_up: { label: "Retirado", color: "bg-green-100 text-green-800" },
  scheduled: { label: "Agendado", color: STATUS_COLOR },
  in_progress: { label: "En ejecución", color: STATUS_COLOR },
  completed: { label: "Completado", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Transferencia bancaria",
  paypal: "PayPal",
  datafast: "Tarjeta de crédito/débito",
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  motorcycle: "Moto",
  car: "Auto",
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [timeSlots, setTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = useAuthStore((s) => !!s.user);
  const urlToken = searchParams.get("token");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      if (urlToken) {
        localStorage.setItem("encanto-guest-token", urlToken);
      }

      try {
        const accessToken = await useAuthStore.getState().getValidAccessToken();
        // Only send a guest token when it was provided explicitly via URL
        // (email link) or when the user is NOT logged in. A stale localStorage
        // guest token from a previous guest order makes the BE reject with
        // 401 "Token de invitado invalido" even if the JWT is valid.
        const guestToken = urlToken
          ? urlToken
          : accessToken
            ? undefined
            : localStorage.getItem("encanto-guest-token") || undefined;

        const [orderData, pageData] = await Promise.all([
          getOrderByOrderNumberAction(orderNumber, accessToken, guestToken),
          getOrderPageDataAction(),
        ]);
        setOrder(orderData);
        setBankAccounts(pageData.bankAccounts);
        setTimeSlots(pageData.timeSlots);
      } catch (err) {
        console.error("Error fetching order:", err);
        if (err instanceof Error) {
          const msg = err.message.toLowerCase();
          // Token-related 401 → guest link expired/invalid. Clean stale token
          // so we don't retry with it on next visit.
          const tokenIssue =
            err.message.startsWith("[401]") ||
            msg.includes("invalidguesttoken") ||
            msg.includes("token de invitado") ||
            msg.includes("token de acceso") ||
            msg.includes("expirado");
          if (tokenIssue) {
            try {
              localStorage.removeItem("encanto-guest-token");
            } catch { /* ignore */ }
            setError("expired_token");
          } else if (err.message.includes("404")) {
            setError("not_found");
          } else if (err.message.includes("403")) {
            setError("no_access");
          } else {
            setError("generic");
          }
        } else {
          setError("generic");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [orderNumber, urlToken]);

  // Auto-link guest orders to the logged-in user. The BE only lists orders
  // in /orders/my when order.userId matches the JWT user, so a guest order
  // (userId=null) never shows up in history even if the user later logs in.
  // Call claim-guest-orders once when we detect this condition, then refetch
  // so the order is shown as user-owned and future actions use the JWT path.
  const claimedRef = useRef(false);
  useEffect(() => {
    if (claimedRef.current) return;
    if (!order || order.userId !== null) return;
    const user = useAuthStore.getState().user;
    if (!user || !user.emailVerified) return;
    if (
      order.senderEmail &&
      user.email &&
      order.senderEmail.toLowerCase() !== user.email.toLowerCase()
    ) {
      return;
    }
    claimedRef.current = true;
    (async () => {
      try {
        const accessToken = await useAuthStore.getState().getValidAccessToken();
        if (!accessToken) return;
        await claimGuestOrdersAction(accessToken);
        // Refetch order so we pick up the new userId; future actions (cancel,
        // upload proof, paypal) will then send only the JWT.
        const refreshed = await getOrderByOrderNumberAction(
          orderNumber,
          accessToken,
          undefined
        );
        setOrder(refreshed);
      } catch { /* non-critical, silent */ }
    })();
  }, [order, orderNumber]);

  // Auto-scroll to action section when order has pending action
  useEffect(() => {
    if (!order || isLoading) return;
    const isTransfer = order.paymentMethod === "bank_transfer";
    const isPayPal = order.paymentMethod === "paypal";
    const needsAction =
      (isTransfer && order.paymentStatus === "pending" && !order.transferProofUrl) ||
      (isPayPal && order.paymentStatus === "pending");
    if (needsAction && actionRef.current) {
      setTimeout(() => {
        actionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [order, isLoading]);

  const handleCancel = async () => {
    if (!order) return;

    setIsCancelling(true);
    setCancelError(null);
    try {
      const accessToken = await useAuthStore.getState().getValidAccessToken();
      // Avoid sending a stale localStorage guest token when the user is
      // logged in (same rationale as the initial fetch).
      const guestToken = accessToken
        ? undefined
        : localStorage.getItem("encanto-guest-token") || undefined;
      const updated = await cancelOrderAction(order.id, accessToken, guestToken);
      setOrder(updated);
      setShowCancelModal(false);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Error al cancelar el pedido");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUploadSuccess = (updatedOrder: Order) => {
    setOrder(updatedOrder);
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  const getTimeSlotLabel = () => {
    if (order?.deliveryTimeSlot) {
      const slot = order.deliveryTimeSlot;
      return slot.displayLabel || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    }
    if (!order) return "";
    const slot = timeSlots.find((s) => s.id === order.deliveryTimeSlotId);
    if (!slot) return "";
    return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-28 mb-8" />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-7 w-48" />
              </div>
              <Skeleton className="h-4 w-56 mt-1" />
            </div>
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>

          {/* Timeline */}
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <Skeleton className="h-5 w-36 mb-6" />
            <div className="hidden sm:flex items-center gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <Skeleton className="h-3 w-16 mt-2" />
                  </div>
                  {i < 4 && <Skeleton className="flex-1 h-0.5 mx-2" />}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <Skeleton className="h-5 w-44 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3.5 w-24 mb-1" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div>
                <Skeleton className="h-3.5 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="sm:col-span-2">
                <Skeleton className="h-3.5 w-20 mb-1" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div>
                <Skeleton className="h-3.5 w-12 mb-1" />
                <Skeleton className="h-4 w-44" />
              </div>
              <div>
                <Skeleton className="h-3.5 w-16 mb-1" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <Skeleton className="h-5 w-24 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3.5 w-20 mt-1" />
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-14" />
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <Skeleton className="h-5 w-12 mb-4" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    const isNoAccess = error === "no_access";
    const isNotFound = error === "not_found";
    const isExpired = error === "expired_token";

    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="max-w-md mx-auto text-center">
          {isExpired ? (
            <>
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">El enlace expiró</h1>
              <p className="text-foreground-secondary mb-6">
                Este enlace solo es válido por unos días. Si necesitas ver tu pedido,
                inicia sesión con la cuenta que usaste para comprarlo o contáctanos
                por WhatsApp para enviarte un nuevo enlace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/">Iniciar sesión</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={BUSINESS.whatsapp.url(`Hola! El enlace para ver mi pedido ${orderNumber} expiró, ¿pueden enviarme uno nuevo?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contactar por WhatsApp
                  </a>
                </Button>
              </div>
            </>
          ) : isNoAccess ? (
            <>
              <Package className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Pedido no disponible</h1>
              <p className="text-foreground-secondary mb-6">
                No pudimos mostrar este pedido. Si crees que es un error, contáctanos por WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/productos">Ver productos</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={BUSINESS.whatsapp.url("Hola! No puedo ver mi pedido")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contactar por WhatsApp
                  </a>
                </Button>
              </div>
            </>
          ) : isNotFound ? (
            <>
              <Package className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Pedido no encontrado</h1>
              <p className="text-foreground-secondary mb-6">
                No pudimos encontrar este pedido. Verifica el número o revisa tus pedidos desde tu perfil.
              </p>
              <Button asChild>
                <Link href="/productos">Ver productos</Link>
              </Button>
            </>
          ) : (
            <>
              <AlertTriangle className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Algo salió mal</h1>
              <p className="text-foreground-secondary mb-6">
                No pudimos cargar tu pedido. Por favor intenta de nuevo en unos momentos.
              </p>
              <Button asChild>
                <Link href="/productos">Ver productos</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const statusInfo = ORDER_STATUS_LABELS[order.orderStatus] || { label: order.orderStatus, color: "bg-gray-100 text-gray-800" };
  const isTransfer = order.paymentMethod === "bank_transfer";
  const isPickup = order.fulfillmentType === "pickup";
  const isService = order.orderType === "service";
  const canCancel = order.orderStatus === "pending_payment";
  const isPayPal = order.paymentMethod === "paypal";
  const canUploadProof = isTransfer && order.paymentStatus === "pending" && !order.transferProofUrl;
  const canPayWithPayPal = isPayPal && order.paymentStatus === "pending";
  const showTransferRejection = isTransfer && order.paymentStatus === "pending" && order.transferRejectionReason;

  // Timeline steps
  const timelineSteps = isService
    ? [
        { key: "created", label: "Orden creada", date: order.createdAt, active: true },
        { key: "paid", label: "Pago confirmado", date: order.paymentStatus === "paid" ? order.updatedAt : null, active: order.paymentStatus === "paid" },
        { key: "scheduled", label: "Agendado", date: null, active: ["scheduled", "in_progress", "completed"].includes(order.orderStatus) },
        { key: "in_progress", label: "En ejecución", date: null, active: ["in_progress", "completed"].includes(order.orderStatus) },
        { key: "completed", label: "Completado", date: null, active: order.orderStatus === "completed" },
      ]
    : isPickup
    ? [
        { key: "created", label: "Pedido creado", date: order.createdAt, active: true },
        { key: "paid", label: "Pago confirmado", date: order.paymentStatus === "paid" ? order.updatedAt : null, active: order.paymentStatus === "paid" },
        { key: "preparing", label: "En preparación", date: order.preparationStartedAt, active: ["preparing", "ready_for_pickup", "picked_up"].includes(order.orderStatus) },
        { key: "ready", label: "Listo para retirar", date: order.preparationCompletedAt, active: ["ready_for_pickup", "picked_up"].includes(order.orderStatus) },
        { key: "picked_up", label: "Retirado", date: order.deliveredAt, active: order.orderStatus === "picked_up" },
      ]
    : [
        { key: "created", label: "Pedido creado", date: order.createdAt, active: true },
        { key: "paid", label: "Pago confirmado", date: order.paymentStatus === "paid" ? order.updatedAt : null, active: order.paymentStatus === "paid" },
        { key: "preparing", label: "En preparación", date: order.preparationStartedAt, active: ["preparing", "delivery_assigned", "out_for_delivery", "delivered"].includes(order.orderStatus) },
        { key: "dispatched", label: "En camino", date: order.dispatchedAt, active: ["out_for_delivery", "delivered"].includes(order.orderStatus) },
        { key: "delivered", label: "Entregado", date: order.deliveredAt, active: order.orderStatus === "delivered" },
      ];

  return (
    <div className="py-8">
      {isLoggedIn && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pedidos">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Mis pedidos
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
            </div>
            <p className="text-sm text-foreground-secondary">
              Creado el {formatDateTime(order.createdAt, "long")}
            </p>
          </div>
          <span className={cn("text-sm px-3 py-1.5 rounded-full font-normal", statusInfo.color)}>
            {statusInfo.label}
          </span>
        </div>

        {/* Transfer rejection banner */}
        {showTransferRejection && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-normal text-amber-800">Transferencia rechazada</p>
                <p className="text-sm text-amber-700 mt-1">{order.transferRejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {order.orderStatus !== "cancelled" && (
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <h2 className="font-medium mb-6">Estado del pedido</h2>

            {/* Mobile: vertical */}
            <div className="flex flex-col gap-0 sm:hidden">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-normal shrink-0",
                        step.active
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground-muted"
                      )}
                    >
                      {index + 1}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-8",
                          step.active ? "bg-primary" : "bg-secondary"
                        )}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className={cn(
                      "text-sm",
                      step.active ? "text-foreground font-normal" : "text-foreground-muted"
                    )}>
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: horizontal */}
            <div className="hidden sm:flex items-start w-full">
              {timelineSteps.map((step, index) => (
                <div key={step.key} className={cn("flex items-start", index < timelineSteps.length - 1 ? "flex-1" : "")}>
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-normal",
                        step.active
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground-muted"
                      )}
                    >
                      {index + 1}
                    </div>
                    <p className={cn(
                      "text-xs mt-2 text-center w-24",
                      step.active ? "text-foreground font-normal" : "text-foreground-muted"
                    )}>
                      {step.label}
                    </p>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mt-[18px]",
                        step.active ? "bg-primary" : "bg-secondary"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Person */}
        {order.deliveryPerson && (
          <div className="bg-background rounded-xl border border-border p-6 mb-6">
            <h2 className="font-medium mb-4">Tu repartidor</h2>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary/30 shrink-0">
                {order.deliveryPerson.avatarUrl ? (
                  <Image
                    src={order.deliveryPerson.avatarUrl}
                    alt={order.deliveryPerson.fullName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-6 w-6 text-foreground-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-normal">{order.deliveryPerson.fullName}</p>
                <a
                  href={`tel:${order.deliveryPerson.phone}`}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {formatPhone(order.deliveryPerson.phone)}
                </a>

                {order.deliveryPerson.vehicle && (
                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
                      {order.deliveryPerson.vehicle.vehicleType === "motorcycle" ? (
                        <Bike className="h-4 w-4" />
                      ) : (
                        <Car className="h-4 w-4" />
                      )}
                      <span>
                        {VEHICLE_TYPE_LABELS[order.deliveryPerson.vehicle.vehicleType] || order.deliveryPerson.vehicle.vehicleType}
                        {" - "}
                        {order.deliveryPerson.vehicle.brand} {order.deliveryPerson.vehicle.model}
                        {order.deliveryPerson.vehicle.year ? ` (${order.deliveryPerson.vehicle.year})` : ""}
                      </span>
                    </div>
                  </div>
                )}

                {order.deliveryPerson.vehicle && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-foreground-secondary">
                    <span>Color: {order.deliveryPerson.vehicle.color}</span>
                    <span>Placa: {order.deliveryPerson.vehicle.licensePlate}</span>
                  </div>
                )}

                {order.deliveryPerson.vehicle?.imageUrl && (
                  <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden bg-secondary/30">
                    <Image
                      src={order.deliveryPerson.vehicle.imageUrl}
                      alt="Vehículo"
                      width={128}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery / Pickup Info (not shown for service orders) */}
        {!isService && (
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">
            {isPickup ? "Información de retiro" : "Información de entrega"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-foreground-secondary">
                {isPickup ? "Quien retira" : "Destinatario"}
              </p>
              <p className="font-normal">{order.recipientName}</p>
            </div>
            {order.recipientPhone && (
              <div>
                <p className="text-foreground-secondary">Teléfono</p>
                <p className="font-normal">{formatPhone(order.recipientPhone)}</p>
              </div>
            )}
            {!isPickup && order.deliveryAddress && (
              <div className="sm:col-span-2">
                <p className="text-foreground-secondary">Dirección</p>
                <p className="font-normal">{order.deliveryAddress}, {order.deliveryCity}</p>
              </div>
            )}
            {!isPickup && order.deliveryReference && (
              <div className="sm:col-span-2">
                <p className="text-foreground-secondary">Referencia</p>
                <p className="font-normal">{order.deliveryReference}</p>
              </div>
            )}
            {!isPickup && order.deliveryZone && (
              <div>
                <p className="text-foreground-secondary">Zona de entrega</p>
                <p className="font-normal">{order.deliveryZone.zoneName}</p>
              </div>
            )}
            <div>
              <p className="text-foreground-secondary">
                {isPickup ? "Fecha de retiro" : "Fecha"}</p>
              <p className="font-normal">
                {formatDate(order.deliveryDate, "full")}
              </p>
            </div>
            <div>
              <p className="text-foreground-secondary">
                {isPickup ? "Horario de retiro" : "Horario"}
              </p>
              <p className="font-normal">{getTimeSlotLabel()}</p>
            </div>
            {!isPickup && (order.isSurprise || order.isAnonymous) && (
              <div className="sm:col-span-2 flex flex-wrap gap-3 pt-1">
                {order.isSurprise && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    <Gift className="h-3.5 w-3.5" />
                    Entrega sorpresa
                  </span>
                )}
                {order.isAnonymous && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    <EyeOff className="h-3.5 w-3.5" />
                    Envío anónimo
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Products */}
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">{isService ? "Detalle" : "Productos"}</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary/30 shrink-0">
                  {item.primaryImageUrl ? (
                    <Image
                      src={item.primaryImageUrl}
                      alt={item.productNameSnapshot}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-foreground-muted" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <p className="font-normal text-sm">{item.productNameSnapshot}</p>
                    <p className="font-normal text-sm shrink-0">{formatPrice(item.lineTotalCents)}</p>
                  </div>
                  <p className="text-xs text-foreground-secondary">Cantidad: {item.quantity}</p>
                  {item.addOns.length > 0 && (
                    <div className="mt-1">
                      {item.addOns.map((addOn) => (
                        <p key={addOn.id} className="text-xs text-foreground-muted">
                          + {addOn.addOnNameSnapshot} x{addOn.quantity} ({formatPrice(addOn.lineTotalCents)})
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
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-4 pt-4 space-y-2">
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
            {!isPickup && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">Envío</span>
                <span>{order.deliveryFeeCents === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(order.deliveryFeeCents)}</span>
              </div>
            )}
            {order.transferDiscountCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Descuento transferencia</span>
                <span className="text-green-600">-{formatPrice(order.transferDiscountCents)}</span>
              </div>
            )}
            {order.discountAmountCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Descuento aplicado</span>
                <span className="text-green-600">-{formatPrice(order.discountAmountCents)}</span>
              </div>
            )}
            {order.taxCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">IVA (15%)</span>
                <span>{formatPrice(order.taxCents)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg border-t border-border pt-2">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalCents)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">Pago</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Método</span>
              <span className="font-normal">{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground-secondary">Estado del pago</span>
              <span className="font-normal">{order.paymentStatus === "paid" ? "Confirmado" : order.paymentStatus === "awaiting_verification" ? "Verificando comprobante" : "Pendiente"}</span>
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-medium">Datos de facturación</h2>
          </div>
          {order.invoiceDocumentType === "final_consumer" ? (
            <p className="text-sm text-foreground-secondary">Factura a consumidor final.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground-secondary">Documento</p>
                <p className="font-normal">
                  {
                    {
                      cedula: "Cédula",
                      ruc: "RUC",
                      pasaporte: "Pasaporte",
                      identificacion_exterior: "Documento del exterior",
                      final_consumer: "Consumidor final",
                    }[order.invoiceDocumentType]
                  }
                  {order.invoiceDocumentNumber ? `: ${order.invoiceDocumentNumber}` : ""}
                </p>
              </div>
              {order.invoiceFullName && (
                <div>
                  <p className="text-foreground-secondary">Nombre / Razón social</p>
                  <p className="font-normal">{order.invoiceFullName}</p>
                </div>
              )}
              {order.invoiceEmail && (
                <div className="sm:col-span-2">
                  <p className="text-foreground-secondary">Correo</p>
                  <p className="font-normal break-all">{order.invoiceEmail}</p>
                </div>
              )}
              {order.invoiceAddress && (
                <div className="sm:col-span-2">
                  <p className="text-foreground-secondary">Dirección fiscal</p>
                  <p className="font-normal">{order.invoiceAddress}</p>
                </div>
              )}
              {order.invoicePhone && (
                <div>
                  <p className="text-foreground-secondary">Teléfono</p>
                  <p className="font-normal">{formatPhone(order.invoicePhone)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transfer proof upload */}
        {canUploadProof && (
          <div ref={actionRef} className="mb-6">
            <TransferProofUpload
              orderId={order.id}
              orderUserId={order.userId}
              bankAccounts={bankAccounts}
              totalCents={order.totalCents}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>
        )}

        {/* Transfer proof already uploaded - awaiting verification */}
        {isTransfer && order.paymentStatus === "awaiting_verification" && order.transferProofUrl && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 font-normal">
              Comprobante de pago subido. Estamos verificando tu transferencia.
            </p>
          </div>
        )}

        {/* Transfer proof uploaded and paid */}
        {isTransfer && order.paymentStatus === "paid" && order.transferProofUrl && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800 font-normal">
              Pago verificado correctamente.
            </p>
          </div>
        )}

        {/* PayPal pending payment */}
        {canPayWithPayPal && (
          <div ref={!canUploadProof ? actionRef : undefined} className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-amber-800 font-medium mb-3">
                Tu pedido está pendiente de pago
              </p>
              <Button
                onClick={() => setPaypalModalOpen(true)}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Pagar con PayPal
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canCancel && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowCancelModal(true)}
            >
              Cancelar pedido
            </Button>
          )}
          <Button variant="outline" asChild>
            <a
              href={BUSINESS.whatsapp.url(`Hola! Tengo una consulta sobre mi pedido ${order.orderNumber}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contactar por WhatsApp
            </a>
          </Button>
        </div>

        {/* PayPal Modal */}
        {canPayWithPayPal && (
          <PayPalProvider>
            <PayPalCheckoutModal
              isOpen={paypalModalOpen}
              onClose={() => setPaypalModalOpen(false)}
              orderId={order.id}
              orderNumber={order.orderNumber}
              totalCents={order.totalCents}
              accessToken={(() => {
                try {
                  const tokens = localStorage.getItem("encanto-tokens");
                  if (tokens) return JSON.parse(tokens).accessToken;
                } catch { /* ignore */ }
                return undefined;
              })()}
              guestToken={localStorage.getItem("encanto-guest-token") || undefined}
              onSuccess={(paidOrder) => {
                setOrder(paidOrder);
                setPaypalModalOpen(false);
              }}
              onError={() => {}}
            />
          </PayPalProvider>
        )}
        {/* Cancel confirmation modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-100">
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-sm bg-background rounded-xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
                {!isCancelling && (
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="absolute right-4 top-4 p-1 text-foreground-secondary hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-normal">¿Cancelar este pedido?</h3>
                  <p className="text-sm text-foreground-secondary mt-1">
                    Esta acción no se puede deshacer. El pedido <span className="font-normal">{order.orderNumber}</span> será cancelado.
                  </p>
                </div>
                {cancelError && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                    {cancelError}
                  </div>
                )}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCancelModal(false)}
                    disabled={isCancelling}
                  >
                    Volver
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      "Sí, cancelar"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
