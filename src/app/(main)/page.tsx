import Link from "next/link";
import { ArrowRight, Search, Palette, CalendarDays, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { InstagramFeed } from "@/components/instagram-feed";
import { HeroCarousel } from "@/components/hero-carousel";
import { ScrollRevealSection } from "@/components/scroll-reveal-section";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { FeaturedShowcase, type ShowcaseItem } from "@/components/featured-showcase";
import type { HeroBanner } from "@/components/hero-carousel";
import { api } from "@/lib/api";
import { getActiveSpecialDatesAction } from "@/actions/special-date-actions";
import { BUSINESS } from "@/lib/constants";

export const revalidate = 60;

export default async function Home() {
  const [bestSellersResponse, featuredResponse, exploreResponse, instagramResponse, reviewsResponse, servicesResponse, specialDates] = await Promise.all([
    api.products.bestSellers(10).catch(() => ({ result: [] })),
    api.products.featured(10),
    api.products.list({ limit: 10, isActive: true }),
    api.instagram.feed({ limit: 6 }).catch(() => ({ result: [], meta: { total: 0, cachedAt: "", expiresAt: "" } })),
    api.reviews.featured().catch(() => ({ result: [] })),
    api.serviceCatalog.featured().catch(() => ({ result: { services: [], banners: [] } })),
    getActiveSpecialDatesAction(),
  ]);

  const bestSellers = bestSellersResponse.result;
  const featuredProducts = featuredResponse.result;
  const exploreProducts = exploreResponse.result;
  const instagramPosts = instagramResponse.result;
  const featuredServices = servicesResponse.result.services;
  const featuredBanners = servicesResponse.result.banners;
  const showcaseItems: ShowcaseItem[] = featuredProducts.map((p) => {
    const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];
    return {
      id: p.id,
      image: primaryImage?.url || "",
      title: p.name,
      description: p.description || "",
      link: `/productos/${p.slug}`,
      linkLabel: "Ver detalle",
    };
  });

  const specialDateHeroBanners: HeroBanner[] = specialDates
    .filter((sd) => sd.isActive && sd.bannerUrl)
    .map((sd) => ({
      id: `special-${sd.id}`,
      imageUrl: sd.bannerUrl!,
      alt: sd.name,
      link: `/fechas-especiales/${sd.slug}`,
    }));

  const testimonials = reviewsResponse.result.map((r) => ({
    id: crypto.randomUUID(),
    name: r.customerName || "Cliente verificado",
    city: r.customerCity || "",
    rating: r.rating,
    comment: r.comment || "",
    date: r.createdAt,
    avatarUrl: r.customerAvatarUrl,
    adminReply: r.adminReply,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      {specialDateHeroBanners.length > 0 && (
        <HeroCarousel banners={specialDateHeroBanners} />
      )}

      {/* Featured Products Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-serif">Los más pedidos</h2>
              <p className="text-foreground-secondary text-sm sm:text-base mt-1">
                Lo que nuestros clientes más eligen
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/productos">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {(bestSellers.length > 0 ? bestSellers : featuredProducts).length > 0 ? (
            <FeaturedProductsCarousel products={bestSellers.length > 0 ? bestSellers : featuredProducts} />
          ) : (
            <p className="text-center text-foreground-secondary py-8">
              No hay productos destacados disponibles.
            </p>
          )}

          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" className="h-11" asChild>
              <Link href="/productos">Ver todos los productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Showcase */}
      <section className="bg-background py-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <FeaturedShowcase items={showcaseItems.length > 0 ? showcaseItems : undefined} />
        </div>
      </section>

      {/* More Products */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-serif">Explora más detalles</h2>
              <p className="text-foreground-secondary text-sm sm:text-base mt-1">
                Arreglos para cada ocasión especial
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/productos">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <FeaturedProductsCarousel products={exploreProducts} />

          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" className="h-11" asChild>
              <Link href="/productos">Ver todos los productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How to Buy */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-serif mb-2 sm:mb-3">¿Cómo comprar?</h2>
            <p className="text-foreground-secondary text-sm sm:text-base">
              En solo 4 pasos tu pedido estará en camino
            </p>
          </div>

          {/* Mobile: 2x2 grid */}
          <div className="grid grid-cols-2 gap-6 sm:hidden">
            {[
              { icon: Search, step: "1", title: "Elige tu arreglo", description: "Explora nuestro catálogo y encuentra el detalle perfecto" },
              { icon: Palette, step: "2", title: "Personaliza", description: "Agrega complementos y escribe tu dedicatoria" },
              { icon: CalendarDays, step: "3", title: "Programa la entrega", description: "Selecciona fecha, horario y dirección" },
              { icon: CreditCard, step: "4", title: "Paga y listo", description: "Transferencia o PayPal, tú eliges" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-normal">{item.title}</h3>
                <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden sm:flex items-start">
            {[
              { icon: Search, step: "1", title: "Elige tu arreglo", description: "Explora nuestro catálogo y encuentra el detalle perfecto" },
              { icon: Palette, step: "2", title: "Personaliza", description: "Agrega complementos y escribe tu dedicatoria" },
              { icon: CalendarDays, step: "3", title: "Programa la entrega", description: "Selecciona fecha, horario y dirección" },
              { icon: CreditCard, step: "4", title: "Paga y listo", description: "Transferencia o PayPal, tú eliges" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-start flex-1">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-12 h-12 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-primary font-normal mt-3">Paso {item.step}</p>
                  <h3 className="text-sm font-normal mt-0.5">{item.title}</h3>
                  <p className="text-xs text-foreground-secondary mt-1 leading-relaxed max-w-[160px] mx-auto">
                    {item.description}
                  </p>
                </div>
                {i < 3 && (
                  <div className="h-px shrink-0 w-10 lg:w-16 bg-border mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Reveal Section / Services */}
      <ScrollRevealSection services={featuredServices} banners={featuredBanners} />

      {/* Testimonials */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-serif mb-2 sm:mb-3">¿Qué dicen nuestros clientes?</h2>
            <p className="text-foreground-secondary text-sm sm:text-base">
              La opinión de quienes confían en nosotros
            </p>
          </div>
          <TestimonialsCarousel testimonials={testimonials.length > 0 ? testimonials : undefined} />
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed posts={instagramPosts} instagramUrl={BUSINESS.social.instagram.url} />

      {/* WhatsApp CTA */}
      <section className="py-8 sm:py-12 bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif mb-3 sm:mb-4">¿Necesitas algo especial?</h2>
          <p className="text-foreground-secondary text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto">
            Contáctanos por WhatsApp para pedidos personalizados, entregas urgentes
            o consultas sobre nuestros arreglos.
          </p>
          <Button size="lg" className="h-12 px-6 sm:px-8" asChild>
            <a
              href={BUSINESS.whatsapp.url()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribir por WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
