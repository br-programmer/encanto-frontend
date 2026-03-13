"use client";

import Image from "next/image";
import Link from "next/link";
import { Flower2, Heart, Star, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StackedCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: LucideIcon;
  link: string;
  linkText: string;
}

const cards: StackedCard[] = [
  {
    id: "amor",
    title: "Amor",
    subtitle: "Expresa lo que sientes",
    description: "Rosas rojas, tulipanes y arreglos románticos para decir 'te amo' sin palabras.",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80",
    icon: Heart,
    link: "/productos?ocasion=amor",
    linkText: "Ver arreglos románticos",
  },
  {
    id: "celebracion",
    title: "Celebración",
    subtitle: "Haz el momento inolvidable",
    description: "Girasoles, gerberas y colores vibrantes para cumpleaños y ocasiones especiales.",
    image: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1920&q=80",
    icon: Sparkles,
    link: "/productos?ocasion=cumpleanos",
    linkText: "Ver arreglos festivos",
  },
  {
    id: "gratitud",
    title: "Gratitud",
    subtitle: "Gracias de corazón",
    description: "Lirios, orquídeas y arreglos elegantes para expresar tu agradecimiento.",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80",
    icon: Star,
    link: "/productos?ocasion=agradecimiento",
    linkText: "Ver arreglos de gratitud",
  },
  {
    id: "condolencias",
    title: "Paz",
    subtitle: "Acompañamos tu sentir",
    description: "Arreglos blancos y serenos que transmiten paz y apoyo en momentos difíciles.",
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1920&q=80",
    icon: Flower2,
    link: "/productos?ocasion=condolencias",
    linkText: "Ver arreglos",
  },
];

export function StackedCardsSection() {
  return (
    <section className="bg-black">
      {/* Intro - NOT sticky, just a regular section */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-black">
        <div className="text-center px-4">
          <p className="text-primary font-medium text-sm sm:text-base uppercase tracking-[0.3em] mb-6">
            Colección por ocasión
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground mb-8">
            Flores para cada
            <br />
            <span className="text-primary">momento de tu vida</span>
          </h2>
          <div className="flex flex-col items-center gap-2 mt-12 animate-bounce">
            <span className="text-foreground-secondary text-sm">Desliza hacia abajo</span>
            <svg
              className="w-6 h-6 text-foreground-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stacked Cards */}
      <div className="relative">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="sticky top-0 min-h-screen w-full"
            style={{ zIndex: index + 1 }}
          >
            <div
              className="min-h-screen w-full overflow-hidden"
              style={{
                borderTopLeftRadius: '2rem',
                borderTopRightRadius: '2rem',
                boxShadow: '0 -20px 50px -10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index < 2}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 min-h-screen flex items-end pb-20 sm:pb-24 md:pb-32">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-2xl">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md mb-6 border border-white/20">
                      {(() => {
                        const IconComponent = card.icon;
                        return <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />;
                      })()}
                    </div>

                    {/* Subtitle */}
                    <p className="text-white/60 text-sm sm:text-base uppercase tracking-[0.2em] mb-3">
                      {card.subtitle}
                    </p>

                    {/* Title */}
                    <h3 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 text-lg sm:text-xl md:text-2xl mb-8 leading-relaxed max-w-lg">
                      {card.description}
                    </p>

                    {/* CTA Button */}
                    <Button
                      size="lg"
                      className="h-12 sm:h-14 px-8 sm:px-10 rounded-full text-base font-medium bg-white text-gray-900 hover:bg-white/90 transition-all duration-300 hover:scale-105"
                      asChild
                    >
                      <Link href={card.link}>
                        {card.linkText}
                      </Link>
                    </Button>
                  </div>

                  {/* Card Number - positioned absolutely */}
                  <span className="absolute bottom-20 sm:bottom-24 md:bottom-32 right-4 sm:right-8 lg:right-16 text-[5rem] sm:text-[8rem] md:text-[10rem] lg:text-[14rem] font-bold font-serif text-white/[0.05] leading-none pointer-events-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final CTA Section */}
      <div
        className="sticky top-0 min-h-screen bg-black flex items-center justify-center"
        style={{ zIndex: cards.length + 1 }}
      >
        <div className="text-center px-4">
          <p className="text-white/50 text-sm uppercase tracking-[0.3em] mb-4">
            No te quedes sin el tuyo
          </p>
          <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-8">
            ¿Cuál es tu momento?
          </h3>
          <Button
            size="lg"
            className="h-14 px-12 rounded-full text-lg font-medium bg-primary hover:bg-primary-hover text-white transition-all duration-300 hover:scale-105"
            asChild
          >
            <Link href="/productos">
              Explorar todos los arreglos
            </Link>
          </Button>
        </div>
      </div>

      {/* Spacer to allow last sticky to scroll away */}
      <div className="h-screen" />
    </section>
  );
}
