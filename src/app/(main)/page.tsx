import Link from "next/link";
import { ArrowRight, Search, Palette, CalendarDays, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedProductsCarousel } from "@/components/featured-products-carousel";
import { CategoriesCarousel } from "@/components/categories-carousel";
import { InstagramFeed } from "@/components/instagram-feed";
import { HeroCarousel } from "@/components/hero-carousel";
import { ScrollRevealSection } from "@/components/scroll-reveal-section";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { api } from "@/lib/api";

export default async function Home() {
  const [productsResponse, categoriesResponse, instagramResponse] = await Promise.all([
    api.products.featured(20),
    api.categories.list({ isActive: true, rootOnly: true, limit: 12 }),
    api.instagram.feed({ limit: 6 }).catch(() => ({ result: [], meta: { total: 0, cachedAt: "", expiresAt: "" } })),
  ]);

  const featuredProducts = productsResponse.result;
  const categories = categoriesResponse.result;
  const instagramPosts = instagramResponse.result;

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroCarousel />

      {/* Featured Products Section */}
      <section className="py-10 sm:py-16 bg-background">
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

          {featuredProducts.length > 0 ? (
            <FeaturedProductsCarousel products={featuredProducts} />
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

      {/* How to Buy */}
      <section className="py-10 sm:py-16 bg-background">
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
                  <div className="w-12 h-12 rounded-full border-2 border-primary bg-background flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-primary font-normal mt-3">Paso {item.step}</p>
                  <h3 className="text-sm font-normal mt-0.5">{item.title}</h3>
                  <p className="text-xs text-foreground-secondary mt-1 leading-relaxed max-w-[160px] mx-auto">
                    {item.description}
                  </p>
                </div>
                {i < 3 && (
                  <div className="h-px flex-shrink-0 w-10 lg:w-16 bg-border mt-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll Reveal Section */}
      <ScrollRevealSection />

      {/* Testimonials */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="font-serif mb-2 sm:mb-3">¿Qué dicen nuestros clientes?</h2>
            <p className="text-foreground-secondary text-sm sm:text-base">
              La opinión de quienes confían en nosotros
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-serif">Nuestras categorías</h2>
              <p className="text-foreground-secondary text-sm sm:text-base mt-1">
                Encuentra el arreglo perfecto para cada ocasión
              </p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/categorias">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {categories.length > 0 ? (
            <CategoriesCarousel categories={categories} />
          ) : (
            <p className="text-center text-foreground-secondary py-8">
              No hay categorías disponibles.
            </p>
          )}

          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" className="h-11" asChild>
              <Link href="/categorias">Ver todas las categorías</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed posts={instagramPosts} instagramUrl="https://www.instagram.com/encantofloristeria_ecu" />

      {/* WhatsApp CTA */}
      <section className="py-12 sm:py-20 bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif mb-3 sm:mb-4">¿Necesitas algo especial?</h2>
          <p className="text-foreground-secondary text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto">
            Contáctanos por WhatsApp para pedidos personalizados, entregas urgentes
            o consultas sobre nuestros arreglos.
          </p>
          <Button size="lg" className="h-12 px-6 sm:px-8" asChild>
            <a
              href="https://wa.me/593982742191?text=Hola!%20Me%20interesa%20un%20arreglo%20floral"
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
