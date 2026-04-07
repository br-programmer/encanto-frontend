"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import { ArrowRight } from "lucide-react";
import type { ServiceCatalog } from "@/lib/api";

interface RevealItemProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function RevealItem({ children, delay = 0, className = "" }: RevealItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface ScrollRevealSectionProps {
  services?: ServiceCatalog[];
}

export function ScrollRevealSection({ services = [] }: ScrollRevealSectionProps) {
  const hasServices = services.length > 0;
  const service1 = services[0] ?? null;
  const service2 = services[1] ?? null;

  const getServiceImages = (service: ServiceCatalog) => {
    const sorted = [...service.images].sort((a, b) => a.displayOrder - b.displayOrder);
    const primary = sorted.find((img) => img.isPrimary) || sorted[0];
    const remaining = sorted.filter((img) => img.id !== primary?.id);
    const second = remaining[0] || primary;
    const third = remaining[1] || null;
    return { primary, second, third };
  };

  const s1 = service1 ? getServiceImages(service1) : null;
  const s2 = service2 ? getServiceImages(service2) : null;

  return (
    <section className="bg-background-alt overflow-hidden">
      {hasServices && (
      <div className="text-center pt-10 sm:pt-14 pb-6 sm:pb-8 px-4">
        <h2 className="font-serif mb-2 sm:mb-3">Servicios especiales</h2>
        <p className="text-foreground-secondary text-sm sm:text-base">
          Experiencias únicas para momentos inolvidables
        </p>
      </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Fila 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* F1C1 — Servicio 1 o imagen por defecto */}
          <RevealItem delay={100} className="w-full">
            {service1 && s1 ? (
              <Link href={`/servicios/${service1.slug}`} className="block group">
                <div className="relative aspect-4/3 overflow-hidden">
                  <SafeImage
                    src={s1.primary?.url || ""}
                    alt={service1.name}
                    fill
                    className={`object-cover ${s1.second ? "transition-opacity duration-1000 group-hover:opacity-0" : ""}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {s1.second && (
                    <SafeImage
                      src={s1.second.url}
                      alt={`${service1.name} - detalle`}
                      fill
                      className="object-cover opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                      01
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-6 pt-16 sm:pt-20">
                    <h3 className="text-white font-serif text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                      {service1.name}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </h3>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative aspect-4/3 overflow-hidden">
                <SafeImage
                  src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80"
                  alt="Encanto Floristería"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                    01
                  </span>
                </div>
              </div>
            )}
          </RevealItem>

          {/* F1C2 — Historia 01 (estática) */}
          <RevealItem delay={200} className="w-full">
            <div className="relative aspect-4/3">
              <SafeImage
                src="/images/historia-01.png"
                alt="Nuestra historia"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </RevealItem>
        </div>

        {/* Fila 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* F2C1 — Historia 02 (estática) */}
          <RevealItem delay={100} className="w-full">
            <div className="relative aspect-4/3">
              <SafeImage
                src="/images/historia-02.png"
                alt="Nuestra historia"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </RevealItem>

          {/* F2C2 — Servicio 2 o imagen por defecto */}
          <RevealItem delay={200} className="w-full">
            {service2 && s2 ? (
              <Link href={`/servicios/${service2.slug}`} className="block group">
                <div className="relative aspect-4/3 overflow-hidden">
                  <SafeImage
                    src={s2.primary?.url || ""}
                    alt={service2.name}
                    fill
                    className={`object-cover ${s2.second ? "transition-opacity duration-1000 group-hover:opacity-0" : ""}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {s2.second && (
                    <SafeImage
                      src={s2.second.url}
                      alt={`${service2.name} - detalle`}
                      fill
                      className="object-cover opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                      02
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-6 pt-16 sm:pt-20">
                    <h3 className="text-white font-serif text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                      {service2.name}
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </h3>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative aspect-4/3 overflow-hidden">
                <SafeImage
                  src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80"
                  alt="Encanto Floristería"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                    02
                  </span>
                </div>
              </div>
            )}
          </RevealItem>
        </div>
      </div>

      {hasServices && (
        <div className="text-center pt-6 sm:pt-8 pb-10 sm:pb-14">
          <Link
            href="/servicios"
            className="inline-flex items-center text-sm text-primary font-medium hover:underline"
          >
            Ver todos los servicios
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}
    </section>
  );
}
