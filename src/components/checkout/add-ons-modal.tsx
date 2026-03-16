"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { SafeImage } from "@/components/ui/safe-image";
import { X, Minus, Plus, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn, formatPrice } from "@/lib/utils";
import type { ProductAddOnsGroup, ProductAddOnItem } from "@/types";
import type { CartItemAddOn } from "@/types";

interface SelectedAddOn {
  addOn: ProductAddOnItem;
  quantity: number;
}

interface AddOnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  addOnGroups: ProductAddOnsGroup[];
  currentAddOns?: CartItemAddOn[];
  onSave: (addOns: CartItemAddOn[]) => void;
}

export function AddOnsModal({
  isOpen,
  onClose,
  productName,
  addOnGroups,
  currentAddOns = [],
  onSave,
}: AddOnsModalProps) {
  const allAddOnsFlat = useMemo(
    () => addOnGroups.flatMap((g) => g.addOns),
    [addOnGroups]
  );

  const [selected, setSelected] = useState<Map<string, SelectedAddOn>>(() => {
    const map = new Map<string, SelectedAddOn>();
    currentAddOns.forEach((ca) => {
      const addOn = allAddOnsFlat.find((a) => a.id === ca.addOnId);
      if (addOn) {
        map.set(addOn.id, { addOn, quantity: ca.quantity });
      }
    });
    return map;
  });
  const [activeTab, setActiveTab] = useState<string | null>(
    addOnGroups.length > 0 ? addOnGroups[0].category.id : null
  );
  const [search, setSearch] = useState("");

  useScrollLock(isOpen);

  // Filtered add-ons for active tab
  const filteredAddOns = useMemo(() => {
    const group = addOnGroups.find((g) => g.category.id === activeTab);
    if (!group) return [];
    const q = search.toLowerCase().trim();
    if (!q) return group.addOns;
    return group.addOns.filter((a) => a.name.toLowerCase().includes(q));
  }, [addOnGroups, activeTab, search]);

  const selectedTotal = useMemo(() => {
    let total = 0;
    selected.forEach(({ addOn, quantity }) => {
      total += addOn.priceCents * quantity;
    });
    return total;
  }, [selected]);

  const handleToggle = (addOn: ProductAddOnItem) => {
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
        imageUrl: addOn.imageUrl,
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

          {/* Tabs + Search */}
          <div className="px-5 py-4 border-b border-border space-y-4">
            {/* Category Tabs */}
            {addOnGroups.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {addOnGroups.map((group) => {
                  const isActive = group.category.id === activeTab;
                  const selectedCount = group.addOns.filter((a) => selected.has(a.id)).length;
                  return (
                    <button
                      key={group.category.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(group.category.id);
                        setSearch("");
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-secondary text-foreground-secondary hover:text-foreground"
                      )}
                    >
                      {group.category.name}
                      {selectedCount > 0 && (
                        <span className={cn(
                          "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center",
                          isActive ? "bg-white text-primary" : "bg-primary text-white"
                        )}>
                          {selectedCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search */}
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
            <div className="px-5 py-6">
              {filteredAddOns.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredAddOns.map((addOn) => {
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

                        <p className="text-xs font-medium line-clamp-2 mb-1">{addOn.name}</p>
                        <p className="text-xs text-primary font-semibold">
                          +{formatPrice(addOn.priceCents)}
                        </p>

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
              ) : (
                <p className="text-sm text-foreground-muted text-center py-8">
                  No se encontraron complementos
                </p>
              )}
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
