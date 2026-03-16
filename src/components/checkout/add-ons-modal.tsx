"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { SafeImage } from "@/components/ui/safe-image";
import { X, Minus, Plus, Package, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import type { AddOn, AddOnCategory } from "@/lib/api";
import type { CartItemAddOn } from "@/types";

interface SelectedAddOn {
  addOn: AddOn;
  quantity: number;
}

interface AddOnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  addOnCategories: AddOnCategory[];
  addOns: AddOn[];
  currentAddOns?: CartItemAddOn[];
  onSave: (addOns: CartItemAddOn[]) => void;
}

export function AddOnsModal({
  isOpen,
  onClose,
  productName,
  addOnCategories,
  addOns,
  currentAddOns = [],
  onSave,
}: AddOnsModalProps) {
  // Initialize selection from current add-ons
  const [selected, setSelected] = useState<Map<string, SelectedAddOn>>(() => {
    const map = new Map<string, SelectedAddOn>();
    currentAddOns.forEach((ca) => {
      const addOn = addOns.find((a) => a.id === ca.addOnId);
      if (addOn) {
        map.set(addOn.id, { addOn, quantity: ca.quantity });
      }
    });
    return map;
  });
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    () => new Set(addOnCategories.map((c) => c.id))
  );
  const [search, setSearch] = useState("");

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Group add-ons by category, filtered by search
  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();
    return addOnCategories
      .map((cat) => ({
        category: cat,
        items: addOns.filter((a) =>
          a.categoryId === cat.id &&
          (!q || a.name.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [addOnCategories, addOns, search]);

  const selectedTotal = useMemo(() => {
    let total = 0;
    selected.forEach(({ addOn, quantity }) => {
      total += addOn.priceCents * quantity;
    });
    return total;
  }, [selected]);

  const handleToggle = (addOn: AddOn) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(addOn.id)) {
        next.delete(addOn.id);
      } else {
        next.set(addOn.id, { addOn, quantity: 1 });
      }
      return next;
    });
  };

  const handleQuantity = (addOnId: string, delta: number) => {
    setSelected((prev) => {
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

  const handleSave = () => {
    const result: CartItemAddOn[] = [];
    selected.forEach(({ addOn, quantity }) => {
      result.push({
        addOnId: addOn.id,
        name: addOn.name,
        priceCents: addOn.priceCents,
        quantity,
      });
    });
    onSave(result);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold text-lg">Agregar complementos</h3>
              <p className="text-sm text-foreground-secondary truncate">
                {productName}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar complementos..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-5 space-y-5">
              {grouped.map(({ category, items }) => {
                const isCollapsed = collapsedCategories.has(category.id);
                const selectedInCategory = items.filter((a) => selected.has(a.id)).length;

                return (
                <div key={category.id}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="group flex items-center justify-between w-full mb-3 py-1.5 px-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors"
                    title={isCollapsed ? "Expandir categoría" : "Colapsar categoría"}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wide group-hover:text-foreground transition-colors">
                        {category.name}
                      </p>
                      {selectedInCategory > 0 && (
                        <span className="text-[10px] bg-primary text-white min-w-5 h-5 inline-flex items-center justify-center rounded-full font-medium">
                          {selectedInCategory}
                        </span>
                      )}
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                  {!isCollapsed && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {items.map((addOn) => {
                      const entry = selected.get(addOn.id);
                      const isSelected = !!entry;

                      return (
                        <div
                          key={addOn.id}
                          className={cn(
                            "flex flex-col items-center p-3 rounded-lg border transition-colors cursor-pointer text-center",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => !isSelected && handleToggle(addOn)}
                        >
                          {/* Image */}
                          {addOn.imageUrl ? (
                            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-secondary mb-2">
                              <SafeImage
                                src={addOn.imageUrl}
                                alt={addOn.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                                fallbackClassName="w-full h-full"
                                iconSize="md"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center mb-2">
                              <Package className="h-6 w-6 text-foreground-muted" />
                            </div>
                          )}

                          {/* Info */}
                          <p className="text-xs font-medium line-clamp-2 mb-1">{addOn.name}</p>
                          <p className="text-xs text-primary font-semibold">
                            +{formatPrice(addOn.priceCents)}
                          </p>

                          {/* Quantity or checkbox */}
                          {isSelected ? (
                            <div
                              className="flex items-center gap-1 mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleQuantity(addOn.id, -1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">
                                {entry.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantity(addOn.id, 1)}
                                className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-secondary transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border border-border mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
                </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border px-5 py-4 space-y-3">
            {selectedTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">
                  {selected.size} complemento{selected.size !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-primary">
                  +{formatPrice(selectedTotal)}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {selected.size > 0 ? "Guardar" : "Sin complementos"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
