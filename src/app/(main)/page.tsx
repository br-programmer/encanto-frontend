import Link from "next/link";
import { ArrowRight, Truck, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { CategoryCard } from "@/components/category-card";
import { InstagramFeed } from "@/components/instagram-feed";
import { HeroCarousel } from "@/components/hero-carousel";
import { api } from "@/lib/api";

export default async function Home() {
  // Fetch categories, featured products, and Instagram feed in parallel
  const [categoriesResponse, productsResponse, instagramResponse] = await Promise.all([
    api.categories.list({ isActive: true, rootOnly: true, limit: 6 }),
    api.products.featured(8),
    api.instagram.feed(6).catch(() => ({ result: [], meta: { total: 0, cachedAt: "", expiresAt: "" } })),
  ]);

  const categories = categoriesResponse.result;
  const featuredProducts = productsResponse.result;
  const instagramPosts = instagramResponse.result;

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <HeroCarousel />

      {/* Categories Section */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-serif">Categorías</h2>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
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

      {/* Featured Products Section */}
      <section className="py-10 sm:py-16 bg-background-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-serif">Productos Destacados</h2>
              <p className="text-foreground-secondary text-sm sm:text-base mt-1">
                Los favoritos de nuestros clientes
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} hideFeaturedBadge />
              ))}
            </div>
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

      {/* Features Section */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-serif mb-2 sm:mb-3">¿Por qué elegirnos?</h2>
            <p className="text-foreground-secondary text-sm sm:text-base">
              Nos esforzamos por hacer cada entrega especial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-warm-white">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Envío el Mismo Día</h3>
              <p className="text-foreground-secondary text-xs sm:text-sm">
                Pedidos antes de las 2pm se entregan el mismo día en Manta.
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl bg-warm-white">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Flores Frescas</h3>
              <p className="text-foreground-secondary text-xs sm:text-sm">
                Seleccionamos las mejores flores cada día para garantizar frescura y calidad.
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl bg-warm-white sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Tarjeta Dedicatoria</h3>
              <p className="text-foreground-secondary text-xs sm:text-sm">
                Incluye un mensaje personalizado para hacer tu regalo más especial.
              </p>
            </div>
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
