"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Star, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/utils";
import type { PendingReviewOrder, CreateReviewRequest } from "@/lib/api";

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PendingReviewOrder | null;
  onSubmit: (orderId: string, data: CreateReviewRequest) => Promise<void>;
}

export function ReviewPromptModal({ isOpen, onClose, order, onSubmit }: ReviewPromptModalProps) {
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      setError(null);
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem("review-prompt-dismissed", "true");
    onClose();
  }, [onClose]);

  const handleSubmit = async () => {
    if (!order || rating === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(order.orderId, {
        rating,
        comment: comment.trim() || undefined,
      });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al enviar la calificación");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isOpen || !order) return null;

  const displayRating = hoveredRating || rating;

  const ratingLabels: Record<number, string> = {
    1: "Malo",
    2: "Regular",
    3: "Bueno",
    4: "Muy bueno",
    5: "Excelente",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleDismiss} />

      {/* Modal Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-md bg-background rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 p-1 text-foreground-secondary hover:text-foreground transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-medium mb-1">
                ¿Cómo fue tu experiencia?
              </h2>
              <p className="text-sm text-foreground-secondary">
                Pedido <span className="font-medium">{order.orderNumber}</span>
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      star <= displayRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-foreground-muted/30"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Rating label */}
            <p className="text-center text-sm text-foreground-secondary mb-6 h-5">
              {displayRating > 0 ? ratingLabels[displayRating] : "Toca una estrella para calificar"}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia... (opcional)"
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
            />
            <p className="text-xs text-foreground-muted text-right mt-1 mb-4">
              {comment.length}/1000
            </p>

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar calificación
                </>
              )}
            </Button>

            {/* Dismiss link */}
            <button
              onClick={handleDismiss}
              className="w-full mt-3 text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Guest Review Modal - same UI but for guest token reviews
interface GuestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onSubmit: (data: CreateReviewRequest) => Promise<void>;
}

export function GuestReviewModal({ isOpen, onClose, orderNumber, onSubmit }: GuestReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      setError(null);
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        rating,
        comment: comment.trim() || undefined,
      });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        const message = err.message;
        if (message.includes("409") || message.includes("already")) {
          setError("Ya calificaste este pedido");
        } else if (message.includes("expired") || message.includes("invalid")) {
          setError("El enlace de calificación ha expirado o no es válido");
        } else {
          setError(message);
        }
      } else {
        setError("Error al enviar la calificación");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const displayRating = hoveredRating || rating;

  const ratingLabels: Record<number, string> = {
    1: "Malo",
    2: "Regular",
    3: "Bueno",
    4: "Muy bueno",
    5: "Excelente",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative w-full max-w-md bg-background rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-foreground-secondary hover:text-foreground transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-medium mb-1">
                ¡Califica tu pedido!
              </h2>
              <p className="text-sm text-foreground-secondary">
                Pedido <span className="font-medium">{orderNumber}</span>
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      star <= displayRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-foreground-muted/30"
                    )}
                  />
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-foreground-secondary mb-6 h-5">
              {displayRating > 0 ? ratingLabels[displayRating] : "Toca una estrella para calificar"}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia... (opcional)"
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
            />
            <p className="text-xs text-foreground-muted text-right mt-1 mb-4">
              {comment.length}/1000
            </p>

            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar calificación
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="w-full mt-3 text-sm text-foreground-secondary hover:text-foreground transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
