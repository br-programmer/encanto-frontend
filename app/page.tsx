import Link from "next/link";
import { ArrowRight, Truck, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { CategoryCard } from "@/components/category-card";
import { InstagramFeed } from "@/components/instagram-feed";
import { SpecialDatesCarousel } from "@/components/special-dates-carousel";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

export default function Home() {
  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.isFeatured).slice(0, 8);
  const categories = MOCK_CATEGORIES.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Special Dates Carousel */}
      <SpecialDatesCarousel />

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif">Categorías</h2>
              <p className="text-foreground-secondary mt-1">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/categorias">Ver todas las categorías</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-background-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif">Productos Destacados</h2>
              <p className="text-foreground-secondary mt-1">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/productos">Ver todos los productos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-3">¿Por qué elegirnos?</h2>
            <p className="text-foreground-secondary">
              Nos esforzamos por hacer cada entrega especial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-warm-white">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío el Mismo Día</h3>
              <p className="text-foreground-secondary text-sm">
                Pedidos antes de las 2pm se entregan el mismo día en Manta.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-warm-white">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flores Frescas</h3>
              <p className="text-foreground-secondary text-sm">
                Seleccionamos las mejores flores cada día para garantizar frescura y calidad.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-warm-white">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tarjeta Dedicatoria</h3>
              <p className="text-foreground-secondary text-sm">
                Incluye un mensaje personalizado para hacer tu regalo más especial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed instagramUrl="https://instagram.com/encanto.floreria" />

      {/* WhatsApp CTA */}
      <section className="py-20 bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif mb-4">¿Necesitas algo especial?</h2>
          <p className="text-foreground-secondary mb-8 max-w-xl mx-auto">
            Contáctanos por WhatsApp para pedidos personalizados, entregas urgentes
            o consultas sobre nuestros arreglos.
          </p>
          <Button size="xl" asChild>
            <a
              href="https://wa.me/593999999999?text=Hola!%20Me%20interesa%20un%20arreglo%20floral"
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
