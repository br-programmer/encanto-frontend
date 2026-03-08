"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Back link */}
          <Link
            href="/productos"
            className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a la tienda</span>
          </Link>

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
  );
}
