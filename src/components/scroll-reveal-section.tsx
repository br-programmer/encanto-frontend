"use client";

import { useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/ui/safe-image";

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
    title: "Nació de un sueño",
    image: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80",
    hoverImage: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80",
    contentImage: "/images/historia-01.png",
  },
  {
    number: "02",
    title: "Tu florería de confianza",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
    hoverImage: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&q=80",
    contentImage: "/images/historia-02.png",
  },
];

export function ScrollRevealSection() {
  return (
    <section className="bg-background-alt overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div>
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="grid grid-cols-1 lg:grid-cols-2"
            >
              {/* Photo with hover swap */}
              <RevealItem
                delay={100}
                className={`w-full ${index % 2 !== 0 ? "lg:order-2" : ""}`}
              >
                <div className="group/img relative aspect-4/3 lg:aspect-auto lg:h-full overflow-hidden">
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
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                    <span className="text-7xl sm:text-8xl md:text-9xl font-medium text-white/20 font-serif leading-none">
                      {step.number}
                    </span>
                  </div>
                </div>
              </RevealItem>

              {/* Content image */}
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
    </section>
  );
}
