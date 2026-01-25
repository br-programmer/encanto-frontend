import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
