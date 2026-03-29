import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

const isIndexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

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
  ...(!isIndexable && {
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  }),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
