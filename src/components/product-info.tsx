"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { ShoppingBag, Minus, Plus, Check, Truck, Package } from "lucide-react";
import { AddOnsModal } from "@/components/checkout/add-ons-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/components/ui/toast";
import { formatPrice, calculateDiscount, getPrimaryImage, cn } from "@/lib/utils";
import type { Product, AddOn, AddOnCategory, CartItemAddOn } from "@/types";

interface SelectedAddOn {
  addOn: AddOn;
  quantity: number;
}

interface ProductInfoProps {
  product: Product;
  addOnCategories?: AddOnCategory[];
  addOns?: AddOn[];
}

export function ProductInfo({ product, addOnCategories = [], addOns = [] }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Map<string, SelectedAddOn>>(new Map());
  const [showAllAddOns, setShowAllAddOns] = useState(false);
  const { addItem, openCart } = useCartStore();
  const { addToast } = useToast();

  const discount = calculateDiscount(product.priceCents, product.comparePriceCents);
  const inStock = product.inStock;
  const primaryImage = getPrimaryImage(product.images);

  // Group add-ons by category
  const addOnsByCategory = useMemo(() => {
    if (addOnCategories.length === 0 || addOns.length === 0) return [];

    return addOnCategories
      .map((cat) => ({
        category: cat,
        items: addOns.filter((a) => a.categoryId === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [addOnCategories, addOns]);

  // First N add-ons to show inline
  const MAX_VISIBLE_ADDONS = 5;
  const allAddOnsFlat = useMemo(() => addOns, [addOns]);
  const visibleAddOns = useMemo(() => allAddOnsFlat.slice(0, MAX_VISIBLE_ADDONS), [allAddOnsFlat]);
  const hasMoreAddOns = allAddOnsFlat.length > MAX_VISIBLE_ADDONS;

  // Calculate add-ons subtotal
  const addOnsSubtotal = useMemo(() => {
    let total = 0;
    selectedAddOns.forEach(({ addOn, quantity: q }) => {
      total += addOn.priceCents * q;
    });
    return total;
  }, [selectedAddOns]);

  const totalPrice = product.priceCents * quantity + addOnsSubtotal;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (product.availableQuantity != null && newValue > product.availableQuantity) return product.availableQuantity;
      return newValue;
    });
  };

  const handleToggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns((prev) => {
      const next = new Map(prev);
      if (next.has(addOn.id)) {
        next.delete(addOn.id);
      } else {
        next.set(addOn.id, { addOn, quantity: 1 });
      }
      return next;
    });
  };

  const handleAddOnQuantity = (addOnId: string, delta: number) => {
    setSelectedAddOns((prev) => {
      const next = new Map(prev);
      const entry = next.get(addOnId);
      if (!entry) return prev;

      const newQty = entry.quantity + delta;
      if (newQty <= 0) {
        next.delete(addOnId);
      } else {
        next.set(addOnId, { ...entry, quantity: Math.min(newQty, 99) });
      }
      return next;
    });
  };

  const handleAddToCart = () => {
    const cartAddOns: CartItemAddOn[] = [];
    selectedAddOns.forEach(({ addOn, quantity: q }) => {
      cartAddOns.push({
        addOnId: addOn.id,
        name: addOn.name,
        priceCents: addOn.priceCents,
        quantity: q,
      });
    });

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceCents: product.priceCents,
        image: primaryImage,
        isQuickDelivery: product.isQuickDelivery,
      },
      quantity,
      cartAddOns.length > 0 ? cartAddOns : undefined
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    addToast(
      quantity > 1
        ? `${quantity} ${product.name} agregados al carrito`
        : `${product.name} agregado al carrito`,
      "cart"
    );
    openCart();

    // Reset add-ons after adding
    setSelectedAddOns(new Map());
    setQuantity(1);
  };

  return (
    <div className="flex flex-col">
      {/* Category */}
      {product.category && (
        <Link
          href={`/categorias/${product.category.slug}`}
          className="text-sm text-primary hover:underline mb-2"
        >
          {product.category.name}
        </Link>
      )}

      {/* Title */}
      <h1 className="text-3xl font-serif">{product.name}</h1>

      {/* Badges */}
      <div className="flex gap-2 mt-3">
        {discount && <Badge variant="destructive">-{discount}% OFF</Badge>}
        {product.isFeatured && <Badge variant="default">Destacado</Badge>}
        {!inStock && <Badge variant="secondary">Agotado</Badge>}
      </div>

      {/* Price */}
      <div className="mt-6">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold text-primary">
            {formatPrice(product.priceCents)}
          </span>
          {product.comparePriceCents && (
            <span className="text-lg text-foreground-muted line-through">
              {formatPrice(product.comparePriceCents)}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-6">
          <p className="text-foreground-secondary leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {/* Stock Status */}
      <div className="mt-6 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            inStock ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-foreground-secondary">
          {inStock ? (product.availableQuantity != null ? `${product.availableQuantity} disponibles` : "Disponible") : "Sin stock"}
        </span>
      </div>

      {/* Add-ons Selection */}
      {inStock && addOns.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">Complementa tu pedido</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visibleAddOns.map((addOn) => {
              const selected = selectedAddOns.get(addOn.id);
              const isSelected = !!selected;

              return (
                <div
                  key={addOn.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => !isSelected && handleToggleAddOn(addOn)}
                >
                  {addOn.imageUrl ? (
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      <SafeImage
                        src={addOn.imageUrl}
                        alt={addOn.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        fallbackClassName="w-full h-full"
                        iconSize="sm"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-foreground-muted" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-normal truncate">{addOn.name}</p>
                    <p className="text-sm text-primary font-medium">
                      +{formatPrice(addOn.priceCents)}
                    </p>
                  </div>
                  {isSelected ? (
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleAddOnQuantity(addOn.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-normal">{selected.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleAddOnQuantity(addOn.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded border border-border flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Ver todos button */}
          {hasMoreAddOns && (
            <button
              type="button"
              onClick={() => setShowAllAddOns(true)}
              className="mt-3 text-sm text-primary font-normal hover:underline flex items-center gap-1"
            >
              Ver todos los complementos ({allAddOnsFlat.length})
            </button>
          )}

          {/* All add-ons modal */}
          <AddOnsModal
            isOpen={showAllAddOns}
            onClose={() => setShowAllAddOns(false)}
            productName={product.name}
            addOnCategories={addOnCategories}
            addOns={addOns}
            currentAddOns={Array.from(selectedAddOns.values()).map(({ addOn, quantity: q }) => ({
              addOnId: addOn.id,
              name: addOn.name,
              priceCents: addOn.priceCents,
              quantity: q,
            }))}
            onSave={(newAddOns) => {
              const newMap = new Map<string, SelectedAddOn>();
              newAddOns.forEach((ca) => {
                const addOn = addOns.find((a) => a.id === ca.addOnId);
                if (addOn) {
                  newMap.set(addOn.id, { addOn, quantity: ca.quantity });
                }
              });
              setSelectedAddOns(newMap);
            }}
          />
        </div>
      )}

      {/* Quantity Selector & Add to Cart */}
      {inStock && (
        <div className="mt-6 space-y-4">
          {/* Quantity */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm font-normal">Cantidad:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-normal">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={product.availableQuantity != null && quantity >= product.availableQuantity}
                className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Price summary with add-ons */}
          {addOnsSubtotal > 0 && (
            <div className="p-3 bg-secondary/30 rounded-lg space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Producto ({quantity}x)</span>
                <span>{formatPrice(product.priceCents * quantity)}</span>
              </div>
              {Array.from(selectedAddOns.values()).map(({ addOn, quantity: q }) => (
                <div key={addOn.id} className="flex justify-between">
                  <span className="text-foreground-secondary">+ {addOn.name}{q > 1 ? ` (${q}x)` : ""}</span>
                  <span>{formatPrice(addOn.priceCents * q)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t border-border pt-1">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!inStock || isAdded}
          >
            {!inStock ? (
              "Agotado"
            ) : isAdded ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Agregado al carrito
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Agregar al carrito — {formatPrice(totalPrice)}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Shipping Info */}
      <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Truck className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-normal text-sm">Entrega programada</p>
            <p className="text-sm text-foreground-secondary mt-1">
              Programa tu entrega con al menos 2 días de anticipación. ¿Lo necesitas hoy?{" "}
              <a
                href="https://wa.me/593982742191?text=Hola!%20Necesito%20un%20pedido%20para%20hoy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Contáctanos por WhatsApp
              </a>.
            </p>
          </div>
        </div>
      </div>

      {/* SKU */}
      {product.sku && (
        <p className="mt-6 text-xs text-foreground-muted">SKU: {product.sku}</p>
      )}
    </div>
  );
}
