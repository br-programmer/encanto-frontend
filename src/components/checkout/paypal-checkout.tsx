"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Loader2, X, ShieldCheck } from "lucide-react";
import { paypalCreateOrderAction, paypalCaptureAction } from "@/actions/order-actions";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/api";

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  totalCents: number;
  accessToken?: string;
  guestToken?: string;
  onSuccess: (order: Order) => void;
  onError: (error: string) => void;
}

export function PayPalCheckoutModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  totalCents,
  accessToken,
  guestToken,
  onSuccess,
  onError,
}: PayPalCheckoutModalProps) {
  const mounted = useIsMounted();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error when modal opens. Adjusting state during render avoids the
  // cascading-render lint.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setError(null);
  }

  useScrollLock(isOpen);

  // No keyboard close - only X button

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-100">
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-md bg-background rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {!isProcessing && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 text-foreground-secondary hover:text-foreground transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Completa tu pago</h2>
              <p className="text-sm text-foreground-secondary mt-1">
                Pedido {orderNumber}
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatPrice(totalCents)}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <div className="relative">
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm font-medium">Procesando pago...</span>
                </div>
              )}
              <PayPalButtonsWrapper
                orderId={orderId}
                accessToken={accessToken}
                guestToken={guestToken}
                onProcessing={setIsProcessing}
                onSuccess={onSuccess}
                onError={(msg) => {
                  setError(msg);
                  onError(msg);
                }}
              />
            </div>

            <p className="text-xs text-foreground-secondary text-center mt-4">
              Si cierras esta ventana sin pagar, puedes completar el pago desde &quot;Mis pedidos&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function PayPalButtonsWrapper({
  orderId,
  accessToken,
  guestToken,
  onProcessing,
  onSuccess,
  onError,
}: {
  orderId: string;
  accessToken?: string;
  guestToken?: string;
  onProcessing: (v: boolean) => void;
  onSuccess: (order: Order) => void;
  onError: (error: string) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-foreground-secondary">Cargando PayPal...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "pay",
      }}
      createOrder={async () => {
        try {
          const { paypalOrderId } = await paypalCreateOrderAction(orderId, accessToken, guestToken);
          return paypalOrderId;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error creando orden PayPal";
          onError(message);
          throw err;
        }
      }}
      onApprove={async () => {
        onProcessing(true);
        try {
          const paidOrder = await paypalCaptureAction(orderId, accessToken, guestToken);
          onSuccess(paidOrder);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error capturando pago";
          onError(message);
        } finally {
          onProcessing(false);
        }
      }}
      onError={(err) => {
        console.error("PayPal error:", err);
        onError("Hubo un error con PayPal. Intenta de nuevo.");
      }}
      onCancel={() => {
        // User closed popup without paying - order stays in pending_payment
      }}
    />
  );
}
