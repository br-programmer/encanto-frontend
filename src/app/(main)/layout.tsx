import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/layout/cart-sidebar";
import { FloatingCartButton } from "@/components/layout/floating-cart-button";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Providers } from "@/components/providers";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
      <FloatingCartButton />
      <ScrollToTop />
    </Providers>
  );
}
