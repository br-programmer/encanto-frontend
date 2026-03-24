"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, Package, ChevronLeft, AlertTriangle, Phone, Bike, Car, User, CreditCard, Gift, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransferProofUpload } from "@/components/orders/transfer-proof-upload";
import { PayPalProvider } from "@/components/checkout/paypal-provider";
import { PayPalCheckoutModal } from "@/components/checkout/paypal-checkout";
import { getOrderByOrderNumberAction, cancelOrderAction, getOrderPageDataAction } from "@/actions/order-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, BankAccount, DeliveryTimeSlot } from "@/lib/api";

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
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);

  const urlToken = searchParams.get("token");

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      if (urlToken) {
        localStorage.setItem("encanto-guest-token", urlToken);
      }

      try {
        const accessToken = (() => {
          try {
            const tokens = localStorage.getItem("encanto-tokens");
            if (tokens) return JSON.parse(tokens).accessToken;
          } catch { /* ignore */ }
          return undefined;
        })();
        const guestToken = urlToken || localStorage.getItem("encanto-guest-token") || undefined;

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
          if (err.message.includes("404")) {
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

  const handleCancel = async () => {
    if (!order || !confirm("¿Estás seguro de cancelar este pedido?")) return;

    setIsCancelling(true);
    try {
      const accessToken = (() => {
        try {
          const tokens = localStorage.getItem("encanto-tokens");
          if (tokens) return JSON.parse(tokens).accessToken;
        } catch { /* ignore */ }
        return undefined;
      })();
      const guestToken = localStorage.getItem("encanto-guest-token") || undefined;
      const updated = await cancelOrderAction(order.id, accessToken, guestToken);
      setOrder(updated);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message || "Error al cancelar el pedido");
      }
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
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
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
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0" />
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

    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="max-w-md mx-auto text-center">
          {isNoAccess ? (
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
                    href="https://wa.me/593982742191?text=Hola!%20No%20puedo%20ver%20mi%20pedido"
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
  const canCancel = order.orderStatus === "pending_payment";
  const isPayPal = order.paymentMethod === "paypal";
  const canUploadProof = isTransfer && order.paymentStatus === "pending" && !order.transferProofUrl;
  const canPayWithPayPal = isPayPal && order.paymentStatus === "pending";
  const showTransferRejection = isTransfer && order.paymentStatus === "pending" && order.transferRejectionReason;

  // Timeline steps
  const timelineSteps = isPickup
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

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Package className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
            </div>
            <p className="text-sm text-foreground-secondary">
              Creado el {new Date(order.createdAt).toLocaleDateString("es-EC", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
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
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
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
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-normal flex-shrink-0",
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
                  <div className="flex flex-col items-center flex-shrink-0">
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
              <div className="w-14 h-14 rounded-full overflow-hidden bg-secondary/30 flex-shrink-0">
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
                  {order.deliveryPerson.phone}
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

        {/* Delivery / Pickup Info */}
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
                <p className="font-normal">{order.recipientPhone}</p>
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
                {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString("es-EC", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
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

        {/* Products */}
        <div className="bg-background rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
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
                    <p className="font-normal text-sm flex-shrink-0">{formatPrice(item.lineTotalCents)}</p>
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

        {/* Transfer proof upload */}
        {canUploadProof && (
          <div className="mb-6">
            <TransferProofUpload
              orderId={order.id}
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
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
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar pedido"
              )}
            </Button>
          )}
          <Button variant="outline" asChild>
            <a
              href={`https://wa.me/593982742191?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20pedido%20${order.orderNumber}`}
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
      </div>
    </div>
  );
}
