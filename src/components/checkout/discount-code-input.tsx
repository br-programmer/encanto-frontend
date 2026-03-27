"use client";

import { useState } from "react";
import { Loader2, Tag, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateDiscountCodeAction } from "@/actions/order-actions";
import { formatPrice } from "@/lib/utils";

interface DiscountCodeInputProps {
  subtotalCents: number;
  paymentMethod: string;
  onApply: (result: { code: string; discountAmountCents: number; type: string; value: number }) => void;
  onClear: () => void;
  appliedCode?: string | null;
  appliedAmount?: number;
}

export function DiscountCodeInput({
  subtotalCents,
  paymentMethod,
  onApply,
  onClear,
  appliedCode,
  appliedAmount = 0,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateDiscountCodeAction(trimmed, subtotalCents, paymentMethod);
      if (result.valid && result.discountAmountCents) {
        onApply({
          code: trimmed.toUpperCase(),
          discountAmountCents: result.discountAmountCents,
          type: result.type || "percentage",
          value: result.value || 0,
        });
        setCode("");
      } else {
        setError(result.message || "Código no válido");
      }
    } catch {
      setError("Error al validar el código");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setError(null);
    onClear();
  };

  // Applied state
  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-normal text-green-800 dark:text-green-400">{appliedCode}</span>
          <span className="text-sm text-green-600">-{formatPrice(appliedAmount)}</span>
        </div>
        <button
          onClick={handleClear}
          className="p-1 text-foreground-secondary hover:text-foreground transition-colors"
          aria-label="Quitar código"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            type="text"
            placeholder="Código de descuento"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            disabled={isValidating}
            className="pl-9 h-10 text-sm uppercase"
          />
        </div>
        <Button
          variant="outline"
          className="h-10 px-4"
          onClick={handleApply}
          disabled={isValidating || !code.trim()}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Aplicar"
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1.5">{error}</p>
      )}
    </div>
  );
}
