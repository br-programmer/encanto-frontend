"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  footer,
  closeOnOverlayClick = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-100">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className="absolute inset-0 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        <div
          className={cn(
            "relative w-full bg-background rounded-xl shadow-xl my-auto flex flex-col max-h-[calc(100dvh-2rem)]",
            SIZE_CLASSES[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-foreground-secondary hover:text-foreground transition-colors z-10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          {(title || description) && (
            <div className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
              {title && <h2 className="text-lg font-medium pr-8">{title}</h2>}
              {description && (
                <p className="text-sm text-foreground-secondary mt-1 pr-8">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <div className="px-6 py-4 border-t border-border flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
