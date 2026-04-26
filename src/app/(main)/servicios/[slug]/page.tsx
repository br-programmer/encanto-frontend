import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Users, MessageCircle, ExternalLink, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { BUSINESS } from "@/lib/constants";
import { ProductGallery } from "@/components/product-gallery";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import type { ServiceCatalog } from "@/lib/api";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const service = await api.serviceCatalog.getBySlug(slug);
    return {
      title: `${service.name} | Encanto Floristería`,
      description: service.shortDescription || service.description || "",
    };
  } catch {
    return { title: "Servicio no encontrado" };
  }
}

function CtaButton({ cta, serviceSlug }: { cta: ServiceCatalog["cta"]; serviceSlug: string }) {
  if (!cta) {
    return (
      <Button size="lg" asChild>
        <Link href={`/solicitar-servicio?service=${serviceSlug}`}>
          Solicitar cotización
        </Link>
      </Button>
    );
  }

  if (cta.type === "quote_form") {
    return (
      <Button size="lg" asChild>
        <Link href={`/solicitar-servicio?service=${serviceSlug}`}>
          {cta.label}
        </Link>
      </Button>
    );
  }

  if (cta.type === "whatsapp") {
    const message = cta.value || "Hola! Me interesa este servicio";
    return (
      <Button size="lg" asChild>
        <a
          href={`https://wa.me/${BUSINESS.whatsapp.number}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          {cta.label}
        </a>
      </Button>
    );
  }

  if (cta.type === "external_link" && cta.value) {
    return (
      <Button size="lg" asChild>
        <a href={cta.value} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4 mr-2" />
          {cta.label}
        </a>
      </Button>
    );
  }

  return null;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let service: ServiceCatalog;
  try {
    service = await api.serviceCatalog.getBySlug(slug);
  } catch {
    notFound();
  }

  const galleryImages = service.images.map((img) => ({
    id: img.id,
    productId: service.id,
    url: img.url,
    altText: img.altText,
    displayOrder: img.displayOrder,
    isPrimary: img.isPrimary,
    createdAt: img.createdAt,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb
        items={[
          { label: "Servicios", href: "/servicios" },
          { label: service.name },
        ]}
      />

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Gallery */}
          <div>
            {galleryImages.length > 0 ? (
              <ProductGallery images={galleryImages} productName={service.name} rounded={false} />
            ) : (
              <div className="aspect-square bg-secondary flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-foreground-muted" />
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif mb-4">{service.name}</h1>

            {service.shortDescription && (
              <p className="text-lg text-foreground-secondary mb-6">
                {service.shortDescription}
              </p>
            )}

            {service.description && (
              <div className="prose prose-sm text-foreground-secondary mb-8 max-w-none">
                <p className="whitespace-pre-line">{service.description}</p>
              </div>
            )}

            {/* CTA */}
            <CtaButton cta={service.cta} serviceSlug={service.slug} />
          </div>
        </div>
      </div>

      {/* Highlights */}
      {service.highlights && service.highlights.length > 0 && (
        <section className="py-12 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif mb-8 text-center">Lo que incluye</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-background rounded-xl">
                  <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {highlight.icon ? (
                      <span className="text-lg">{highlight.icon}</span>
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">{highlight.title}</h3>
                    {highlight.description && (
                      <p className="text-xs text-foreground-secondary">{highlight.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages */}
      {service.packages && service.packages.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif mb-8 text-center">Paquetes disponibles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.packages.map((pkg, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-xl border ${pkg.isAvailable ? "border-border bg-background" : "border-border/50 bg-secondary/20 opacity-60"}`}
                >
                  <h3 className="font-medium mb-2">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-foreground-secondary mb-3">{pkg.description}</p>
                  )}
                  {pkg.capacity && (
                    <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                      <Users className="h-3.5 w-3.5" />
                      {pkg.capacity}
                    </div>
                  )}
                  {!pkg.isAvailable && (
                    <p className="text-xs text-foreground-muted mt-2 italic">No disponible</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
