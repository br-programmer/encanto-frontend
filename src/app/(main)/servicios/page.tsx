import Link from "next/link";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { SafeImage } from "@/components/ui/safe-image";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Servicios | Encanto Floristería",
  description: "Servicios experienciales para momentos únicos: propuestas, eventos, decoración floral y más.",
};

export const revalidate = 60;

export default async function ServiciosPage() {
  const { result: services } = await api.serviceCatalog.list();

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Servicios" }]} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif mb-4">Nuestros Servicios</h1>
          <p className="text-foreground-secondary text-lg">
            Creamos experiencias florales únicas para tus momentos más especiales
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => {
              const primaryImage = service.images.find((img) => img.isPrimary) || service.images[0];

              return (
                <Link
                  key={service.id}
                  href={`/servicios/${service.slug}`}
                  className="group block bg-white dark:bg-stone-900 shadow-md border border-secondary hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Polaroid photo area */}
                  <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
                    <div className="relative aspect-4/3 overflow-hidden bg-secondary">
                      {primaryImage ? (
                        <SafeImage
                          src={primaryImage.url}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          fallbackClassName="w-full h-full"
                          iconSize="lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-10 w-10 text-foreground-muted" />
                        </div>
                      )}
                      {service.isFeatured && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default" className="text-xs">Destacado</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Polaroid caption */}
                  <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 text-center">
                    <h2 className="font-serif text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h2>
                    {service.shortDescription && (
                      <p className="text-xs sm:text-sm text-foreground-secondary mt-1 line-clamp-2">
                        {service.shortDescription}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-secondary">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="py-12 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif mb-3">¿Tienes algo especial en mente?</h2>
          <p className="text-foreground-secondary mb-6 max-w-lg mx-auto">
            Cuéntanos tu idea y te ayudamos a hacerla realidad.
          </p>
          <Button size="lg" asChild>
            <Link href="/solicitar-servicio">Solicitar cotización</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
