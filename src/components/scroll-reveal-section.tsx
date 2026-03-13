"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
    title: "Elige con amor",
    description:
      "Explora nuestra colección de arreglos florales diseñados para cada ocasión especial.",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Personaliza tu mensaje",
    description:
      "Añade una dedicatoria única que exprese exactamente lo que sientes.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
  },
  {
    number: "03",
    icon: Package,
    title: "Preparamos con cuidado",
    description:
      "Nuestros floristas seleccionan las flores más frescas y crean tu arreglo con dedicación.",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
  },
  {
    number: "04",
    icon: Truck,
    title: "Entrega puntual",
    description:
      "Llevamos tu regalo directamente a la puerta de quien más quieres, justo a tiempo.",
    image: "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&q=80",
  },
];

export function ScrollRevealSection() {
  return (
    <section className="py-20 sm:py-28 md:py-36 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealItem className="text-center mb-16 sm:mb-24">
          <p className="text-primary font-medium text-sm sm:text-base uppercase tracking-wider mb-4">
            Cómo funciona
          </p>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl mb-6">
            Regalar flores
            <br />
            <span className="text-primary">nunca fue tan fácil</span>
          </h2>
          <p className="text-foreground-secondary text-lg sm:text-xl max-w-2xl mx-auto">
            En cuatro simples pasos, haz que alguien especial sonría hoy.
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
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Number overlay */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-bold text-white/20 font-serif leading-none">
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
            ¿Listo para sorprender?
          </p>
          <a
            href="/productos"
            className="inline-flex items-center justify-center h-14 px-10 bg-primary hover:bg-primary-hover text-white rounded-full text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Explorar arreglos
          </a>
        </RevealItem>
      </div>
    </section>
  );
}
