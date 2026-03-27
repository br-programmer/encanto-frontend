"use client";

import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";
import { Heart, Sparkles } from "lucide-react";

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
      "Encanto comenzó como un pequeño emprendimiento en Manta, con la ilusión de llevar alegría a cada hogar a través de las flores. Lo que empezó como un sueño hoy es la florería de confianza de cientos de familias.",
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
    hoverImage: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Tu florería de confianza",
    description:
      "Cada arreglo es diseñado a mano, cuidando los colores, las texturas y la frescura de cada flor. Nos esforzamos por hacer de cada entrega un momento especial, porque regalar flores es regalar emociones.",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    hoverImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80",
  },
];

export function ScrollRevealSection() {
  return (
    <section className="bg-background-alt overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Steps */}
        <div>
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="grid grid-cols-1 lg:grid-cols-2"
            >
              {/* Image with hover swap */}
              <RevealItem
                delay={100}
                className={`w-full ${index % 2 !== 0 ? "lg:order-2" : ""}`}
              >
                <div className="group/img relative aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden">
                  <SafeImage
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-opacity duration-1000 group-hover/img:opacity-0"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <SafeImage
                    src={step.hoverImage}
                    alt={`${step.title} - detalle`}
                    fill
                    className="object-cover opacity-0 transition-opacity duration-1000 group-hover/img:opacity-100"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Number overlay */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                      {step.number}
                    </span>
                  </div>
                </div>
              </RevealItem>

              {/* Content */}
              <div className={`w-full flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20 text-center lg:text-left ${index % 2 !== 0 ? "lg:order-1" : ""}`}>
                <RevealItem delay={200}>
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-secondary mb-4 sm:mb-6">
                    <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                </RevealItem>

                <RevealItem delay={300}>
                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-3 sm:mb-5">
                    {step.title}
                  </h3>
                </RevealItem>

                <RevealItem delay={400}>
                  <p className="text-foreground-secondary text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                    {step.description}
                  </p>
                </RevealItem>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
