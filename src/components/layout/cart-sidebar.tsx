"use client";

import { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartSidebar() {
  const [mounted, setMounted] = useState(false);
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use empty array on server, real items after mount
  const displayItems = mounted ? items : [];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 cursor-pointer",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-[100vw] sm:max-w-md bg-background z-50 shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Tu Carrito</h2>
              <span className="text-sm text-foreground-secondary">
                ({displayItems.length} {displayItems.length === 1 ? "item" : "items"})
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          {displayItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-primary" />
              </div>
              <p className="text-foreground-secondary text-center">
                Tu carrito está vacío
              </p>
              <Button onClick={closeCart} asChild>
                <Link href="/productos">Ver Productos</Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {displayItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-3 sm:gap-4 p-2 sm:p-3 bg-warm-white rounded-lg"
                    >
                      {/* Image */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 64px, 80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-foreground-muted" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/productos/${item.product.slug}`}
                          className="font-medium text-xs sm:text-sm hover:text-primary transition-colors line-clamp-2"
                          onClick={closeCart}
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-primary font-semibold text-sm sm:text-base mt-1">
                          {formatPrice(item.product.priceCents)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 sm:h-10 sm:w-10"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 sm:h-10 sm:w-10"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 sm:h-10 sm:w-10 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-border p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-secondary text-sm sm:text-base">Subtotal</span>
                  <span className="text-base sm:text-lg font-semibold">
                    {formatPrice(mounted ? totalPrice() : 0)}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  Envío calculado en el checkout
                </p>
                <Separator />
                <div className="grid gap-2">
                  <Button size="lg" className="w-full h-12" asChild>
                    <Link href="/checkout" onClick={closeCart}>
                      Proceder al Pago
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full h-12"
                    onClick={closeCart}
                  >
                    Seguir Comprando
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
