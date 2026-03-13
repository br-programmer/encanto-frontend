import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://encanto.com.ec";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Encanto | Floristeria en Manta, Ecuador - Arreglos Florales a Domicilio",
  description:
    "Floristeria Encanto en Manta, Ecuador. Arreglos florales para cumpleanos, aniversarios, amor, condolencias y toda ocasion. Envios a domicilio el mismo dia. Rosas, girasoles, tulipanes y mas.",
  keywords: [
    "floristeria Manta",
    "flores Manta Ecuador",
    "arreglos florales Manta",
    "envio de flores Manta",
    "rosas Manta",
    "floristeria Ecuador",
    "flores a domicilio Manta",
    "regalos florales",
    "arreglos de rosas",
    "flores para cumpleanos",
    "flores para aniversario",
    "girasoles",
    "tulipanes",
    "bouquet de flores",
    "floristeria online Ecuador",
  ],
  authors: [{ name: "Encanto Floristeria" }],
  creator: "Encanto Floristeria",
  publisher: "Encanto Floristeria",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: SITE_URL,
    siteName: "Encanto Floristeria",
    title: "Encanto | Floristeria en Manta, Ecuador",
    description:
      "Arreglos florales para toda ocasion. Rosas, girasoles, tulipanes y mas. Envios a domicilio en Manta, Ecuador.",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Encanto Floristeria - Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Encanto | Floristeria en Manta, Ecuador",
    description:
      "Arreglos florales para toda ocasion. Envios a domicilio en Manta.",
    images: ["/android-chrome-512x512.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
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
  category: "floristeria",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Florist",
  name: "Encanto Floristeria",
  description:
    "Floristeria en Manta, Ecuador. Arreglos florales para toda ocasion con envio a domicilio.",
  url: SITE_URL,
  logo: `${SITE_URL}/android-chrome-512x512.png`,
  image: `${SITE_URL}/android-chrome-512x512.png`,
  telephone: "+593982742191",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manta",
    addressRegion: "Manabi",
    addressCountry: "EC",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -0.9676,
    longitude: -80.7089,
  },
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "08:00",
    closes: "18:00",
  },
  sameAs: ["https://www.instagram.com/encanto.ec"],
  areaServed: {
    "@type": "City",
    name: "Manta",
    containedInPlace: {
      "@type": "Country",
      name: "Ecuador",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
