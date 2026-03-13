"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order, PaginatedResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: "Pendiente de pago", color: "bg-amber-100 text-amber-800" },
  paid: { label: "Pagado", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "Preparando", color: "bg-purple-100 text-purple-800" },
  out_for_delivery: { label: "En camino", color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-gray-100 text-gray-800" },
  awaiting_verification: { label: "Verificando", color: "bg-amber-100 text-amber-800" },
  paid: { label: "Confirmado", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function MisPedidosPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      setIsLoading(true);
      try {
        const response = await api.orders.my({ page, limit: 10 });
        setOrders(response.result);
        setMeta(response.meta);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [user, page]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/perfil">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al perfil
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Mis Pedidos</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="space-y-4">
            {orders.map((order) => {
              const orderStatus = ORDER_STATUS_LABELS[order.orderStatus] || { label: order.orderStatus, color: "bg-gray-100 text-gray-800" };
              const paymentStatus = PAYMENT_STATUS_LABELS[order.paymentStatus] || { label: order.paymentStatus, color: "bg-gray-100 text-gray-800" };

              return (
                <Link
                  key={order.id}
                  href={`/pedidos/${order.id}`}
                  className="block bg-background rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">{order.orderNumber}</p>
                        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", orderStatus.color)}>
                          {orderStatus.label}
                        </span>
                        <span className={cn("text-xs px-2 py-1 rounded-full font-medium", paymentStatus.color)}>
                          {paymentStatus.label}
                        </span>
                      </div>
                      <p className="text-sm text-foreground-secondary">
                        {order.recipientName} — {order.deliveryAddress}, {order.deliveryCity}
                      </p>
                      <p className="text-sm text-foreground-secondary">
                        Entrega: {new Date(order.deliveryDate + "T00:00:00").toLocaleDateString("es-EC", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-primary">
                        {formatPrice(order.totalCents)}
                      </p>
                      <p className="text-xs text-foreground-secondary">
                        {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-foreground-secondary">
                Página {meta.page} de {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
