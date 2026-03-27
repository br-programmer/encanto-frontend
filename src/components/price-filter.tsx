"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CollectionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Availability
  const currentAvailability = searchParams.get("inStock");
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const availabilityRef = useRef<HTMLDivElement>(null);

  // Price
  const currentMin = searchParams.get("minPrice") || "";
  const currentMax = searchParams.get("maxPrice") || "";
  const [priceOpen, setPriceOpen] = useState(false);
  const [min, setMin] = useState(currentMin);
  const [max, setMax] = useState(currentMax);
  const priceRef = useRef<HTMLDivElement>(null);

  const hasFilters = currentAvailability || currentMin || currentMax;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (availabilityRef.current && !availabilityRef.current.contains(e.target as Node)) {
        setAvailabilityOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
        setPriceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const applyFilter = (params: URLSearchParams) => {
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleAvailability = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("inStock", value); else params.delete("inStock");
    applyFilter(params);
    setAvailabilityOpen(false);
  };

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min); else params.delete("minPrice");
    if (max) params.set("maxPrice", max); else params.delete("maxPrice");
    applyFilter(params);
    setPriceOpen(false);
  };

  const handleClearAll = () => {
    setMin("");
    setMax("");
    router.push("?");
  };

  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <span className="text-sm text-foreground-muted">Filtrar:</span>

      {/* Availability dropdown */}
      <div className="relative" ref={availabilityRef}>
        <button
          onClick={() => { setAvailabilityOpen(!availabilityOpen); setPriceOpen(false); }}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors",
            currentAvailability ? "text-primary" : "text-foreground-secondary hover:text-foreground"
          )}
        >
          Disponibilidad
          <ChevronDown className={cn("h-4 w-4 transition-transform", availabilityOpen && "rotate-180")} />
        </button>

        {availabilityOpen && (
          <div className="absolute top-full left-0 mt-2 w-44 bg-background border border-border rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => handleAvailability(null)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 transition-colors",
                !currentAvailability && "text-primary"
              )}
            >
              Todos
            </button>
            <button
              onClick={() => handleAvailability("true")}
              className={cn(
                "w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 transition-colors",
                currentAvailability === "true" && "text-primary"
              )}
            >
              En stock
            </button>
          </div>
        )}
      </div>

      {/* Price dropdown */}
      <div className="relative" ref={priceRef}>
        <button
          onClick={() => { setPriceOpen(!priceOpen); setAvailabilityOpen(false); }}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors",
            (currentMin || currentMax) ? "text-primary" : "text-foreground-secondary hover:text-foreground"
          )}
        >
          Precio
          <ChevronDown className={cn("h-4 w-4 transition-transform", priceOpen && "rotate-180")} />
        </button>

        {priceOpen && (
          <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-lg z-20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Mínimo</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
                  className="h-9 text-sm"
                  min="0"
                />
              </div>
              <span className="text-foreground-muted mt-5">—</span>
              <div>
                <label className="text-xs text-foreground-muted mb-1 block">Máximo</label>
                <Input
                  type="number"
                  placeholder="$999"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
                  className="h-9 text-sm"
                  min="0"
                />
              </div>
            </div>
            <Button size="sm" className="w-full h-8" onClick={handlePriceApply}>
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-xs text-foreground-secondary hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Limpiar
        </button>
      )}
    </div>
  );
}
