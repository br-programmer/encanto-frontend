"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package, ChevronLeft, ChevronRight, Truck, Store, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import { getMyOrdersAction } from "@/actions/order-actions";
import { formatPrice } from "@/lib/utils";
import type { OrderListItem } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_COLOR = "bg-primary/10 text-primary";
const STATUS_SUCCESS = "bg-green-100 text-green-800";
const STATUS_CANCELLED = "bg-red-100 text-red-800";

function getOrderStatusDisplay(order: OrderListItem): { label: string; color: string } {
  if (order.orderStatus === "cancelled") return { label: "Cancelado", color: STATUS_CANCELLED };
  if (order.orderStatus === "delivered") return { label: "Entregado", color: STATUS_SUCCESS };
  if (order.orderStatus === "picked_up") return { label: "Retirado", color: STATUS_SUCCESS };
  if (order.orderStatus === "out_for_delivery") return { label: "En camino", color: STATUS_COLOR };
  if (order.orderStatus === "delivery_assigned") return { label: "Repartidor asignado", color: STATUS_COLOR };
  if (order.orderStatus === "ready_for_pickup") return { label: "Listo para retirar", color: STATUS_COLOR };
  if (order.orderStatus === "preparing") return { label: "En preparación", color: STATUS_COLOR };
  if (order.paymentStatus === "awaiting_verification") return { label: "Verificando pago", color: STATUS_COLOR };
  if (order.orderStatus === "paid") return { label: "Pagado", color: STATUS_COLOR };
  return { label: "Pendiente de pago", color: STATUS_COLOR };
}

export default function MisPedidosPage() {
  const router = useRouter();
  const { user, tokens, isLoading: authLoading, refreshToken, _hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (_hasHydrated && !authLoading && !user) {
      router.push("/");
    }
  }, [_hasHydrated, authLoading, user, router]);

  useEffect(() => {
    if (!user || !tokens?.accessToken) return;

    async function fetchOrders() {
      setIsLoading(true);
      try {
        const response = await getMyOrdersAction({ page, limit: 10 }, tokens!.accessToken);
        setOrders(response.result);
        setMeta(response.meta);
      } catch (err) {
        // If 401, try refreshing token and retry
        if (err instanceof Error && err.message.includes("401")) {
          const refreshed = await refreshToken();
          if (refreshed) {
            const newTokens = useAuthStore.getState().tokens;
            if (newTokens?.accessToken) {
              try {
                const response = await getMyOrdersAction({ page, limit: 10 }, newTokens.accessToken);
                setOrders(response.result);
                setMeta(response.meta);
                return;
              } catch {
                // Refresh didn't help
              }
            }
          }
        }
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user, tokens, page]);

  if (!_hasHydrated || authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/perfil">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al perfil
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-semibold text-center">Mis Pedidos</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3 max-w-2xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background rounded-xl border border-border p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-foreground-muted" />
          </div>
          <p className="text-foreground-secondary mb-4">No tienes pedidos aún</p>
          <Button asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-w-2xl mx-auto">
            {orders.map((order) => {
              const status = getOrderStatusDisplay(order);
              const isService = order.orderType === "service";
              const isPickup = order.fulfillmentType === "pickup";

              // Summary line (middle): adapts to service vs product orders and
              // defends against null recipient/city for service orders.
              const summary = isService
                ? "Servicio"
                : isPickup
                  ? `Retiro${order.recipientName ? ` — ${order.recipientName}` : ""}`
                  : [order.recipientName, order.deliveryCity].filter(Boolean).join(" — ") || "—";

              // Date line (bottom): prefer deliveryDate, fall back to createdAt
              // for orders without a delivery date (services).
              const dateIso = order.deliveryDate
                ? `${order.deliveryDate}T00:00:00`
                : order.createdAt;
              const parsed = new Date(dateIso);
              const dateLabel = !isNaN(parsed.getTime())
                ? parsed.toLocaleDateString("es-EC", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";

              const Icon = isService ? Sparkles : isPickup ? Store : Truck;

              return (
                <Link
                  key={order.id}
                  href={`/pedidos/${order.orderNumber}`}
                  className="block bg-background rounded-xl border border-border p-4 sm:p-5 hover:border-primary/50 transition-colors group"
                >
                  {/* Top: order number + status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-normal text-sm sm:text-base">{order.orderNumber}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0", status.color)}>
                      {status.label}
                    </span>
                  </div>

                  {/* Middle: summary */}
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1.5">
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <p className="truncate">{summary}</p>
                  </div>

                  {/* Bottom: date + price */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground-muted">{dateLabel}</p>
                    <div className="flex items-center gap-1">
                      <p className="font-normal text-base text-primary">
                        {formatPrice(order.totalCents)}
                      </p>
                      <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "dots")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1]) > 1) acc.push("dots");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "dots" ? (
                    <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-foreground-muted text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors",
                        page === item
                          ? "bg-primary text-white"
                          : "hover:bg-secondary text-foreground-secondary"
                      )}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
