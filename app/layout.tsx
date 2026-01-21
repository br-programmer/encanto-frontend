import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/layout/cart-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Encanto | Floristería en Manta, Ecuador",
    template: "%s | Encanto",
  },
  description:
    "Arreglos florales para toda ocasión. Rosas, girasoles, tulipanes y más. Envíos a domicilio en Manta.",
  keywords: [
    "floristería",
    "flores",
    "rosas",
    "arreglos florales",
    "Manta",
    "Ecuador",
    "envío de flores",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartSidebar />
      </body>
    </html>
  );
}
