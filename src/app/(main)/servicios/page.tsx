import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { SafeImage } from "@/components/ui/safe-image";
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const primaryImage = service.images.find((img) => img.isPrimary) || service.images[0];

              return (
                <Link
                  key={service.id}
                  href={`/servicios/${service.slug}`}
                  className="group bg-background border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-4/3 overflow-hidden">
                    {primaryImage ? (
                      <SafeImage
                        src={primaryImage.url}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-foreground-muted" />
                      </div>
                    )}
                    {service.isFeatured && (
                      <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        Destacado
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h2>
                    {service.shortDescription && (
                      <p className="text-sm text-foreground-secondary line-clamp-3 mb-4">
                        {service.shortDescription}
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm text-primary font-medium">
                      Ver más
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
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
