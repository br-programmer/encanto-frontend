"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { ShoppingBag, Minus, Plus, Check, Truck, Package } from "lucide-react";
import { AddOnsModal } from "@/components/checkout/add-ons-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, calculateDiscount, isInStock, getPrimaryImage, cn } from "@/lib/utils";
import type { Product, ProductAddOnsGroup, ProductAddOnItem, CartItemAddOn } from "@/types";

interface SelectedAddOn {
  addOn: ProductAddOnItem;
  quantity: number;
}

interface ProductInfoProps {
  product: Product;
  addOnGroups?: ProductAddOnsGroup[];
}

export function ProductInfo({ product, addOnGroups = [] }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Map<string, SelectedAddOn>>(new Map());
  const [showAllAddOns, setShowAllAddOns] = useState(false);
  const { addItem } = useCartStore();

  const discount = calculateDiscount(product.priceCents, product.comparePriceCents);
  const stock = product.stock ?? product.inventory?.quantity ?? 0;
  const inStock = isInStock(stock);
  const primaryImage = getPrimaryImage(product.images);

  const allAddOnsFlat = useMemo(
    () => addOnGroups.flatMap((g) => g.addOns),
    [addOnGroups]
  );
  const hasAddOns = allAddOnsFlat.length > 0;

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
      if (newValue > stock) return stock;
      return newValue;
    });
  };

  const handleToggleAddOn = (addOn: ProductAddOnItem) => {
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
        imageUrl: addOn.imageUrl,
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
      },
      quantity,
      cartAddOns.length > 0 ? cartAddOns : undefined
    );

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

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
          <span className="text-3xl font-bold text-primary">
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
          {inStock ? `${stock} disponibles` : "Sin stock"}
        </span>
      </div>

      {/* Add-ons Selection */}
      {inStock && hasAddOns && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">Complementa tu regalo</h3>

          {/* Add-ons Grid (max 4 visible) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allAddOnsFlat.slice(0, 4).map((addOn) => {
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
                        <p className="text-sm font-medium truncate">{addOn.name}</p>
                        <p className="text-sm text-primary font-semibold">
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
                          <span className="w-6 text-center text-sm font-medium">{selected.quantity}</span>
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
              {allAddOnsFlat.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllAddOns(true)}
                  className="mt-3 text-sm text-primary font-medium hover:underline"
                >
                  Ver todos los complementos ({allAddOnsFlat.length})
                </button>
              )}

          {/* All add-ons modal */}
          <AddOnsModal
            isOpen={showAllAddOns}
            onClose={() => setShowAllAddOns(false)}
            productName={product.name}
            addOnGroups={addOnGroups}
            currentAddOns={Array.from(selectedAddOns.values()).map(({ addOn, quantity: q }) => ({
              addOnId: addOn.id,
              name: addOn.name,
              priceCents: addOn.priceCents,
              imageUrl: addOn.imageUrl,
              quantity: q,
            }))}
            onSave={(newAddOns) => {
              const newMap = new Map<string, SelectedAddOn>();
              newAddOns.forEach((ca) => {
                const addOn = allAddOnsFlat.find((a) => a.id === ca.addOnId);
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
            <span className="text-sm font-medium">Cantidad:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= stock}
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
              <div className="flex justify-between font-semibold border-t border-border pt-1">
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
            disabled={isAdded}
          >
            {isAdded ? (
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
          <Truck className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">Envío el mismo día</p>
            <p className="text-sm text-foreground-secondary mt-1">
              Pedidos antes de las 2pm se entregan el mismo día en Manta.
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
