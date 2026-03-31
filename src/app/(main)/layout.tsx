import { Suspense } from "react";
import { TopBanner } from "@/components/layout/top-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/layout/cart-sidebar";
import { FloatingCartButton } from "@/components/layout/floating-cart-button";
import { FloatingWhatsAppButton } from "@/components/layout/floating-whatsapp-button";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ReviewPromptWrapper } from "@/components/review-prompt-wrapper";
import { Providers } from "@/components/providers";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <TopBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
      <FloatingCartButton />
      <FloatingWhatsAppButton />
      <Suspense fallback={null}>
        <ReviewPromptWrapper />
      </Suspense>
      <ScrollToTop />
    </Providers>
  );
}
