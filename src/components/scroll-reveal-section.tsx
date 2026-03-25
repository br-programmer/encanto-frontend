"use client";

import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { Heart, Sparkles, Package, Truck } from "lucide-react";

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

const steps = [
  {
    number: "01",
    icon: Heart,
    title: "Nació de un sueño",
    description:
      "Encanto comenzó como un pequeño emprendimiento en Manta, con la ilusión de llevar alegría a cada hogar a través de las flores.",
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Pasión por cada detalle",
    description:
      "Cada arreglo es diseñado a mano por nuestro equipo, cuidando los colores, las texturas y la frescura de cada flor.",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
  },
  {
    number: "03",
    icon: Package,
    title: "Crecimos junto a ti",
    description:
      "Gracias a la confianza de nuestros clientes, hoy llevamos flores a más ciudades y seguimos creciendo con la misma dedicación del primer día.",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
  },
  {
    number: "04",
    icon: Truck,
    title: "Tu florería de confianza",
    description:
      "Nos esforzamos por hacer de cada entrega un momento especial. Porque regalar flores es regalar emociones.",
    image: "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&q=80",
  },
];

export function ScrollRevealSection() {
  return (
    <section className="py-20 sm:py-28 md:py-36 bg-background-alt overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealItem className="text-center mb-16 sm:mb-24">
          <p className="text-primary font-normal text-sm sm:text-base uppercase tracking-wider mb-4">
            Nuestra historia
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            Más que flores,
            <br />
            <span className="text-primary">entregamos emociones</span>
          </h2>
          <p className="text-foreground-secondary text-lg sm:text-xl max-w-2xl mx-auto">
            Conoce cómo nació Encanto y por qué cada arreglo lleva un pedacito de nuestro corazón.
          </p>
        </RevealItem>

        {/* Steps */}
        <div className="space-y-24 sm:space-y-32 md:space-y-40">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8 sm:gap-12 lg:gap-20`}
            >
              {/* Image */}
              <RevealItem
                delay={100}
                className="w-full lg:w-1/2"
              >
                <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                  <SafeImage
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Number overlay */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-semibold text-white/20 font-serif leading-none">
                      {step.number}
                    </span>
                  </div>
                </div>
              </RevealItem>

              {/* Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <RevealItem delay={200}>
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary mb-6">
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </RevealItem>

                <RevealItem delay={300}>
                  <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6">
                    {step.title}
                  </h3>
                </RevealItem>

                <RevealItem delay={400}>
                  <p className="text-foreground-secondary text-base sm:text-lg md:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </RevealItem>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <RevealItem delay={200} className="text-center mt-20 sm:mt-28 md:mt-36">
          <p className="text-foreground-secondary text-lg sm:text-xl mb-6">
            ¿Quieres conocernos más?
          </p>
          <a
            href="/nosotros"
            className="inline-flex items-center justify-center h-14 px-10 bg-primary hover:bg-primary-hover text-white rounded-full text-lg font-normal transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Sobre nosotros
          </a>
        </RevealItem>
      </div>
    </section>
  );
}
