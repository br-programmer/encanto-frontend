"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/ui/safe-image";
import { Search, X, Loader2, ShoppingBag, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchProductsAction } from "@/actions/product-actions";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [serverError, setServerError] = useState(false);

  useScrollLock(isOpen);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      setServerError(false);
      try {
        const { result } = await searchProductsAction({
          search: query,
          isActive: true,
          limit: 6,
        });
        setResults(result);
      } catch (error) {
        // Handle connection errors gracefully
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          console.warn("Backend server not available - search disabled");
          setServerError(true);
        } else {
          console.error("Search error:", error);
        }
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleProductClick = useCallback(
    (slug: string) => {
      router.push(`/productos/${slug}`);
      onClose();
      setQuery("");
    },
    [router, onClose]
  );

  const handleViewAll = useCallback(() => {
    router.push(`/productos?search=${encodeURIComponent(query)}`);
    onClose();
    setQuery("");
  }, [router, query, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleViewAll();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-2 top-4 sm:inset-x-4 sm:top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="bg-background rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 sm:pl-12 pr-20 sm:pr-12 py-3 sm:py-4 text-base sm:text-lg border-b border-border focus:outline-none"
              autoFocus
            />
            {/* Close button - always visible on mobile, only when query on desktop */}
            <button
              type="button"
              onClick={query ? () => setQuery("") : onClose}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Results */}
          <div className="max-h-[70vh] sm:max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : results.length > 0 ? (
              <div className="p-1.5 sm:p-2">
                {results.map((product) => {
                  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-secondary/50 active:bg-secondary transition-colors text-left"
                    >
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {primaryImage ? (
                          <SafeImage
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 48px, 64px"
                            fallbackClassName="w-full h-full"
                            iconSize="md"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-foreground-muted" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-normal text-sm sm:text-base truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-foreground-secondary truncate">
                          {product.category?.name || "Sin categoría"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-sm sm:text-base text-primary">
                          {formatPrice(product.priceCents)}
                        </p>
                        {product.comparePriceCents && (
                          <p className="text-[10px] sm:text-xs text-foreground-muted line-through">
                            {formatPrice(product.comparePriceCents)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* View All Button */}
                <div className="p-2 sm:p-3 border-t border-border mt-2">
                  <Button
                    variant="outline"
                    className="w-full text-sm sm:text-base"
                    onClick={handleViewAll}
                  >
                    Ver todos los resultados
                  </Button>
                </div>
              </div>
            ) : serverError ? (
              <div className="py-8 sm:py-12 text-center px-4">
                <WifiOff className="h-8 w-8 sm:h-10 sm:w-10 text-foreground-muted mx-auto mb-3" />
                <p className="text-foreground-secondary font-normal text-sm sm:text-base">
                  Servidor no disponible
                </p>
                <p className="text-xs sm:text-sm text-foreground-muted mt-1">
                  No se puede conectar con el servidor.
                </p>
              </div>
            ) : hasSearched && query ? (
              <div className="py-8 sm:py-12 text-center px-4">
                <p className="text-foreground-secondary text-sm sm:text-base">
                  No se encontraron productos para &quot;{query}&quot;
                </p>
                <Button
                  variant="link"
                  className="mt-2 text-sm"
                  onClick={() => {
                    router.push("/productos");
                    onClose();
                  }}
                >
                  Ver todos los productos
                </Button>
              </div>
            ) : (
              <div className="py-6 sm:py-8 px-3 sm:px-4">
                <p className="text-xs sm:text-sm text-foreground-muted text-center mb-3 sm:mb-4">
                  Búsquedas populares
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {["Rosas", "Girasoles", "Tulipanes", "Orquídeas", "Arreglos"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-secondary rounded-full hover:bg-secondary/80 active:bg-secondary/60 transition-colors"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer - hidden on mobile, shown on desktop */}
          <div className="hidden sm:flex px-4 py-3 bg-secondary/30 border-t border-border items-center justify-between text-xs text-foreground-muted">
            <span>ESC para cerrar</span>
            <span>Enter para buscar</span>
          </div>
        </div>
      </div>
    </>
  );
}
