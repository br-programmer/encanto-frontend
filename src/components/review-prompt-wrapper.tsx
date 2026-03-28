"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { getPendingReviewsAction, createReviewAction, createGuestReviewAction } from "@/actions/review-actions";
import { ReviewPromptModal, GuestReviewModal } from "@/components/review-prompt-modal";
import type { PendingReviewOrder, CreateReviewRequest } from "@/lib/api";

export function ReviewPromptWrapper() {
  const { user, tokens } = useAuthStore();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Authenticated review prompt state
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingReviewOrder | null>(null);

  // Guest review state
  const [showGuestReview, setShowGuestReview] = useState(false);
  const [guestReviewToken, setGuestReviewToken] = useState<string | null>(null);
  const [guestOrderNumber, setGuestOrderNumber] = useState("");

  // Check for pending reviews (authenticated users)
  useEffect(() => {
    if (!user || !tokens?.accessToken) return;
    if (sessionStorage.getItem("review-prompt-dismissed")) return;

    getPendingReviewsAction(tokens.accessToken)
      .then((result) => {
        if (result.length > 0) {
          setPendingOrder(result[0]);
          setShowReviewPrompt(true);
        }
      })
      .catch(() => {});
  }, [user, tokens?.accessToken]);

  // Check for guest review token in query params
  useEffect(() => {
    const reviewToken = searchParams.get("reviewToken");
    const orderNumber = searchParams.get("order");

    if (reviewToken && orderNumber) {
      setGuestReviewToken(reviewToken);
      setGuestOrderNumber(orderNumber);
      setShowGuestReview(true);
    }
  }, [searchParams]);

  const handleAuthenticatedReview = async (orderId: string, data: CreateReviewRequest) => {
    if (!tokens?.accessToken) return;
    await createReviewAction(orderId, data, tokens.accessToken);
    addToast("¡Gracias por tu calificación!", "success");
  };

  const handleGuestReview = async (data: CreateReviewRequest) => {
    if (!guestReviewToken) return;
    await createGuestReviewAction(guestReviewToken, data);
    addToast("¡Gracias por tu calificación!", "success");

    // Clean query params from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("reviewToken");
    url.searchParams.delete("order");
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <>
      <ReviewPromptModal
        isOpen={showReviewPrompt}
        onClose={() => setShowReviewPrompt(false)}
        order={pendingOrder}
        onSubmit={handleAuthenticatedReview}
      />
      <GuestReviewModal
        isOpen={showGuestReview}
        onClose={() => {
          setShowGuestReview(false);
          const url = new URL(window.location.href);
          url.searchParams.delete("reviewToken");
          url.searchParams.delete("order");
          router.replace(url.pathname + url.search, { scroll: false });
        }}
        orderNumber={guestOrderNumber}
        onSubmit={handleGuestReview}
      />
    </>
  );
}
