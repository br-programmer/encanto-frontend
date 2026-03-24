"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategorySlugs?: string[];
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  search?: string;
}

export function ProductFilters({
  categories,
  selectedCategorySlugs = [],
  minPrice,
  maxPrice,
  inStock,
  search,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const [localSearch, setLocalSearch] = useState(search || "");
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "");

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`/productos?${params.toString()}`);
    });
  };

  const handleCategoryToggle = (slug: string) => {
    const current = new Set(selectedCategorySlugs);
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("category");
    current.forEach((s) => params.append("category", s));

    startTransition(() => {
      router.push(`/productos?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: localSearch || undefined });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: localMinPrice || undefined,
      maxPrice: localMaxPrice || undefined,
    });
  };

  const handleInStockChange = (checked: boolean) => {
    updateFilters({ inStock: checked ? "true" : undefined });
  };

  const clearAllFilters = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    startTransition(() => {
      router.push("/productos");
    });
  };

  const hasActiveFilters =
    selectedCategorySlugs.length > 0 || minPrice || maxPrice || inStock || search;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-normal mb-3">Buscar</h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
        </form>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-normal mb-3">Categorías</h3>
        <div className="space-y-1">
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("page");
              params.delete("category");
              startTransition(() => {
                router.push(`/productos?${params.toString()}`);
              });
            }}
            className={cn(
              "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              selectedCategorySlugs.length === 0
                ? "bg-primary text-white"
                : "hover:bg-secondary"
            )}
          >
            Todas las categorías
          </button>
          {categories.map((category) => {
            const isSelected = selectedCategorySlugs.includes(category.slug);
            return (
              <label
                key={category.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                  isSelected ? "bg-primary/10" : "hover:bg-secondary"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleCategoryToggle(category.slug)}
                />
                <span className={cn(isSelected && "font-normal")}>{category.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-normal mb-3">Precio</h3>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              placeholder="Min"
              min="0"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <span className="text-foreground-muted">-</span>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              placeholder="Max"
              min="0"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Aplicar precio
          </Button>
        </form>
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={inStock}
            onCheckedChange={(checked) => handleInStockChange(checked === true)}
          />
          <span className="text-sm">Solo productos en stock</span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          className="w-full h-10"
          onClick={clearAllFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Limpiar filtros
        </Button>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="text-center text-sm text-foreground-muted">
          Cargando...
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full h-11"
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filter Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-xs sm:max-w-sm bg-background p-4 sm:p-6 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium">Filtros</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <FiltersContent />
          </div>
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block sticky top-24">
        <FiltersContent />
      </div>
    </>
  );
}
