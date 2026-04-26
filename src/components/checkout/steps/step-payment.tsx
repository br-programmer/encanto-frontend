"use client";

import { Building2, CreditCard, Percent, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscountCodeInput } from "../discount-code-input";
import type { BankAccount, OrderSettings } from "@/lib/api";
import { cn } from "@/lib/utils";

const paymentMethods = [
  {
    value: "bank_transfer",
    label: "Transferencia bancaria",
    icon: Building2,
    available: true,
  },
  {
    value: "paypal",
    label: "PayPal",
    description: "Paga con tarjeta o cuenta PayPal",
    icon: CreditCard,
    available: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  },
  {
    value: "datafast",
    label: "Tarjeta de crédito/débito",
    description: "Próximamente",
    icon: CreditCard,
    available: false,
  },
];

interface StepPaymentProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  bankAccounts: BankAccount[];
  orderSettings: OrderSettings | null;
  subtotalCents: number;
  discountCode: string | null;
  discountAmountCents: number;
  onDiscountApply: (result: { code: string; discountAmountCents: number; type: string; value: number }) => void;
  onDiscountClear: () => void;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}

export function StepPayment({
  paymentMethod,
  onPaymentMethodChange,
  bankAccounts,
  orderSettings,
  subtotalCents,
  discountCode,
  discountAmountCents,
  onDiscountApply,
  onDiscountClear,
  error,
  onNext,
  onBack,
}: StepPaymentProps) {
  const discountLabel = orderSettings
    ? `${orderSettings.transferDiscountPercentage} de descuento`
    : "Descuento por transferencia";

  return (
    <div className="space-y-6">
      {/* Payment method */}
      <div>
        <h2 className="text-lg font-normal mb-4">Método de pago</h2>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const isTransfer = method.value === "bank_transfer";
            const isSelected = paymentMethod === method.value;
            const description = isTransfer && orderSettings
              ? `${orderSettings.transferDiscountPercentage} de descuento por transferencia`
              : method.description || "";

            return (
              <button
                key={method.value}
                type="button"
                onClick={() => method.available && onPaymentMethodChange(method.value)}
                disabled={!method.available}
                className={cn(
                  "flex items-center gap-4 p-4 border rounded-lg transition-all w-full text-left",
                  isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  !method.available && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  isSelected ? "border-primary" : "border-foreground-muted"
                )}>
                  {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
                <method.icon className={cn("h-5 w-5 shrink-0", isSelected ? "text-primary" : "text-foreground-secondary")} />
                <div className="flex-1">
                  <span className="font-normal">{method.label}</span>
                  {isTransfer && orderSettings && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      <Percent className="h-3 w-3" />
                      {discountLabel}
                    </span>
                  )}
                  {description && <p className="text-sm text-foreground-secondary">{description}</p>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bank accounts */}
        {paymentMethod === "bank_transfer" && bankAccounts.length > 0 && (
          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
            <h3 className="text-sm font-normal mb-3">Cuentas para transferencia</h3>
            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="p-3 bg-background rounded-lg border border-border text-sm">
                  <p className="font-normal">{account.bankName}</p>
                  <p className="text-foreground-secondary">
                    {account.accountType === "savings" ? "Ahorros" : "Corriente"} — {account.accountNumber}
                  </p>
                  <p className="text-foreground-secondary">{account.beneficiary}</p>
                  <p className="text-foreground-secondary">
                    {account.documentType === "cedula" ? "C.I." : "RUC"}: {account.documentNumber}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground-secondary mt-3">
              Después de realizar el pedido, podrás subir el comprobante de pago.
            </p>
          </div>
        )}
      </div>

      {/* Discount code */}
      {paymentMethod && (
        <div>
          <h2 className="text-lg font-normal mb-4">Código de descuento</h2>
          <DiscountCodeInput
            subtotalCents={subtotalCents}
            paymentMethod={paymentMethod}
            appliedCode={discountCode}
            appliedAmount={discountAmountCents}
            onApply={onDiscountApply}
            onClear={onDiscountClear}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1 h-12" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button type="button" size="lg" className="flex-1 h-12" onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
