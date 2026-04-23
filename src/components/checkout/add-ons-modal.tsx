"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SafeImage } from "@/components/ui/safe-image";
import { X, Minus, Plus, Package, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollLock } from "@/hooks/use-scroll-lock";
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
  const [mounted, setMounted] = useState(false);

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(addOnCategories.length > 0 ? [addOnCategories[0].id] : [])
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state ONLY on the open transition (false → true). Reading the
  // latest props through a ref prevents re-running this effect every render
  // when `currentAddOns` defaults to a fresh `[]` for items without add-ons.
  const latestPropsRef = useRef({ currentAddOns, addOns, addOnCategories });
  useEffect(() => {
    latestPropsRef.current = { currentAddOns, addOns, addOnCategories };
  });
  useEffect(() => {
    if (!isOpen) return;
    const { currentAddOns: ca, addOns: ao, addOnCategories: aoc } = latestPropsRef.current;
    const map = new Map<string, SelectedAddOn>();
    ca.forEach((item) => {
      const addOn = ao.find((a) => a.id === item.addOnId);
      if (addOn) {
        map.set(addOn.id, { addOn, quantity: item.quantity });
      }
    });
    setSelected(map);
    setSearch("");
    setExpandedCategories(
      new Set(aoc.length > 0 ? [aoc[0].id] : [])
    );
  }, [isOpen]);

  useScrollLock(isOpen);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
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

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:max-w-md bg-background z-[100] shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <div className="min-w-0 flex-1 mr-3">
              <h3 className="font-medium text-lg">Complementos</h3>
              <p className="text-sm text-foreground-secondary truncate">
                {productName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-foreground-secondary hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar complementos..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-5 space-y-4">
              {grouped.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">
                    No se encontraron complementos
                  </p>
                </div>
              )}

              {grouped.map(({ category, items }) => {
                const isExpanded = expandedCategories.has(category.id);
                const selectedInCategory = items.filter((a) => selected.has(a.id)).length;

                return (
                  <div key={category.id}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="group flex items-center justify-between w-full mb-3 py-2 px-3 -mx-1 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <p className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors">
                          {category.name}
                        </p>
                        {selectedInCategory > 0 && (
                          <span className="text-[10px] bg-primary text-white min-w-5 h-5 inline-flex items-center justify-center rounded-full font-normal">
                            {selectedInCategory}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-2">
                        {items.map((addOn) => {
                          const entry = selected.get(addOn.id);
                          const isSelected = !!entry;

                          return (
                            <div
                              key={addOn.id}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/30"
                              )}
                              onClick={() => !isSelected && handleToggle(addOn)}
                            >
                              {/* Image */}
                              {addOn.imageUrl ? (
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                  <SafeImage
                                    src={addOn.imageUrl}
                                    alt={addOn.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
                                    fallbackClassName="w-full h-full"
                                    iconSize="sm"
                                  />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                                  <Package className="h-5 w-5 text-foreground-muted" />
                                </div>
                              )}

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-normal line-clamp-1">{addOn.name}</p>
                                <p className="text-sm text-primary font-medium mt-0.5">
                                  +{formatPrice(addOn.priceCents)}
                                </p>
                              </div>

                              {/* Quantity or checkbox */}
                              {isSelected ? (
                                <div
                                  className="flex items-center gap-1.5 flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleQuantity(addOn.id, -1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-7 text-center text-sm font-medium">
                                    {entry.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuantity(addOn.id, 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded border-2 border-border flex-shrink-0" />
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
          <div className="border-t border-border px-5 py-4 space-y-3 flex-shrink-0">
            {selectedTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground-secondary">
                  {selected.size} complemento{selected.size !== 1 ? "s" : ""}
                </span>
                <span className="font-medium text-primary">
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
