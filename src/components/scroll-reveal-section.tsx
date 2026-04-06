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

interface ServiceStep {
  number: string;
  title: string;
  slug: string;
  primaryImage: string;
  secondImage: string;
  hoverImage: string | null;
}

interface FallbackStep {
  number: string;
  title: string;
  image: string;
  contentImage: string;
}

const FALLBACK_STEPS: FallbackStep[] = [
  {
    number: "01",
    title: "Nació de un sueño",
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
    contentImage: "/images/historia-01.png",
  },
  {
    number: "02",
    title: "Tu florería de confianza",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    contentImage: "/images/historia-02.png",
  },
];

interface ScrollRevealSectionProps {
  services?: ServiceCatalog[];
}

export function ScrollRevealSection({ services = [] }: ScrollRevealSectionProps) {
  const hasServices = services.length >= 2;

  const serviceSteps: ServiceStep[] = hasServices
    ? services.slice(0, 2).map((service, i) => {
        const sorted = [...service.images].sort((a, b) => a.displayOrder - b.displayOrder);
        const primary = sorted.find((img) => img.isPrimary) || sorted[0];
        const remaining = sorted.filter((img) => img.id !== primary?.id);
        const second = remaining[0] || primary;
        const third = remaining[1] || null;

        return {
          number: String(i + 1).padStart(2, "0"),
          title: service.name,
          slug: service.slug,
          primaryImage: primary?.url || "",
          secondImage: second?.url || primary?.url || "",
          hoverImage: third?.url || null,
        };
      })
    : [];

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
        <div>
          {hasServices
            ? serviceSteps.map((step, index) => (
                <Link
                  key={step.number}
                  href={`/servicios/${step.slug}`}
                  className="grid grid-cols-1 lg:grid-cols-2 group cursor-pointer"
                >
                  {/* Primary image */}
                  <RevealItem
                    delay={100}
                    className={`w-full ${index % 2 !== 0 ? "lg:order-2" : ""}`}
                  >
                    <div className="relative aspect-4/3 overflow-hidden">
                      <SafeImage
                        src={step.primaryImage}
                        alt={step.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                          {step.number}
                        </span>
                      </div>
                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-6 pt-16 sm:pt-20">
                        <h3 className="text-white font-serif text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                          {step.title}
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                        </h3>
                      </div>
                    </div>
                  </RevealItem>

                  {/* Second image with hover to third */}
                  <RevealItem
                    delay={200}
                    className={`w-full ${index % 2 !== 0 ? "lg:order-1" : ""}`}
                  >
                    <div className="group/img relative aspect-4/3 overflow-hidden">
                      <SafeImage
                        src={step.secondImage}
                        alt={`${step.title} - detalle`}
                        fill
                        className={`object-cover ${step.hoverImage ? "transition-opacity duration-1000 group-hover/img:opacity-0" : ""}`}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      {step.hoverImage && (
                        <SafeImage
                          src={step.hoverImage}
                          alt={`${step.title} - más`}
                          fill
                          className="object-cover opacity-0 transition-opacity duration-1000 group-hover/img:opacity-100"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      )}
                    </div>
                  </RevealItem>
                </Link>
              ))
            : FALLBACK_STEPS.map((step, index) => (
                <div
                  key={step.number}
                  className="grid grid-cols-1 lg:grid-cols-2"
                >
                  <RevealItem
                    delay={100}
                    className={`w-full ${index % 2 !== 0 ? "lg:order-2" : ""}`}
                  >
                    <div className="relative aspect-4/3 overflow-hidden">
                      <SafeImage
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                        <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </RevealItem>

                  <RevealItem
                    delay={200}
                    className={`w-full ${index % 2 !== 0 ? "lg:order-1" : ""}`}
                  >
                    <div className="relative aspect-4/3">
                      <SafeImage
                        src={step.contentImage}
                        alt={step.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </RevealItem>
                </div>
              ))}
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
