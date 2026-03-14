"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHECKOUT_STORAGE_KEY = "encanto-checkout-form";

export function CheckoutHeader() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmLeave = () => {
    sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    setShowConfirm(false);
    router.push("/productos");
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Back link */}
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a la tienda</span>
            </button>

            {/* Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image
                src="/logo.svg"
                alt="Encanto"
                width={100}
                height={32}
                className="h-7 sm:h-8 w-auto"
                priority
              />
            </Link>

            {/* Secure checkout indicator */}
            <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Pago seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirm &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
              onClick={() => setShowConfirm(false)}
            />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="bg-background rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">
                      ¿Salir del checkout?
                    </h3>
                    <p className="text-sm text-foreground-secondary mt-1">
                      Los datos del formulario se perderán. Tu carrito se mantendrá intacto.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowConfirm(false)}
                  >
                    Continuar pedido
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleConfirmLeave}
                  >
                    Salir
                  </Button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
